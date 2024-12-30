const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const multer = require('multer');
// const bcrypt = require('bcryptjs');
const path = require('path'); 
const cron = require("node-cron");
const { spawn } = require("child_process");

const jwt = require('jsonwebtoken');
const SECRET_KEY = "your_secret_key"; // Replace with a secure, environment-based key


const app = express();
app.use(cors());
app.use(express.json());


// MySQL connection setup
const db = mysql.createConnection({
    host: "localhost",
    user: "miraclecreatives_HRadmin",
    password: "HRadmin1313",
    database: "miraclecreatives_hr_miracle"
});

db.connect(function(err) {
    if(err) {
        console.log("Error in Connection");
    } else {
        console.log("Connected");
    }
});


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadPath = path.join(__dirname, 'public', 'images');
        cb(null, uploadPath); // Ensure the upload path is correct
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`); // Use unique filename to avoid overwriting
    }
});

const upload = multer({ storage });


// Serve static files from 'public' directory
app.use(express.static('public'));

// Endpoint to trigger the Python script
let pythonProcess = null; // Define globally at the top of the file

// Function to check attendance
// Function to check attendance and update the attendance table
async function checkAndUpdateAttendance() {
  const currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
  const connection = pool.promise();

  try {
    // Fetch all emp_ids from the login table
    const [loginResults] = await connection.query("SELECT emp_id FROM login");
    const loggedInEmpIds = loginResults.map((row) => row.emp_id);

    // Fetch all emp_ids from the attendance table for the current day
    const [attendanceResults] = await connection.query(
      "SELECT emp_id FROM attendance WHERE date = ?",
      [currentDate]
    );
    const attendedEmpIds = attendanceResults.map((row) => row.emp_id);

    // Find missing emp_ids
    const missingEmpIds = loggedInEmpIds.filter(
      (id) => !attendedEmpIds.includes(id)
    );

    // Check leave table for missing emp_ids and update the attendance table
    for (const empId of missingEmpIds) {
      const [leaveResults] = await connection.query(
        "SELECT reason FROM employee_leave WHERE emp_id = ? AND ? BETWEEN first_day AND last_day",
        [empId, currentDate]
      );

      if (leaveResults.length > 0) {
        // If employee is on leave, update attendance table with reason
        await connection.query(
          "INSERT INTO attendance (emp_id, date, sign_in, sign_out, hours ) VALUES (?, ?, ?, ?, ?)",
          [empId, currentDate, 0, null, leaveResults[0].reason]
        );
        console.log(`Employee ${empId} is on leave: ${leaveResults[0].reason}`);
      } else {
        // If employee is absent, update attendance table with "Absent"
        await connection.query(
          "INSERT INTO attendance (emp_id, date, sign_in, sign_out, hours) VALUES (?, ?, ?, ?, ?)",
          [empId, currentDate, 0, null, "Absent"]
        );
        console.log(`Employee ${empId} is Absent`);
      }
    }
  } catch (error) {
    console.error("Error checking and updating attendance:", error);
  }
}

// Schedule the task to run at 5 PM every day
cron.schedule("0 17 * * *", checkAndUpdateAttendance);

// API endpoint to get attendance report
app.get("/attendance-check", async (req, res) => {
  try {
    const attendanceReport = await checkAttendance();
    res.status(200).json({ success: true, data: attendanceReport });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching attendance report" });
  }
});


app.post("/start-recognition", (req, res) => {
  if (pythonProcess) {
    return res.status(400).send("Recognition already running.");
  }

  pythonProcess = spawn("python", ["app.py"]);

  pythonProcess.stdout.on("data", (data) => {
    const result = data.toString().trim();
    try {
      const parsedResult = JSON.parse(result); // Assuming Python sends JSON
      console.log("Python Output:", parsedResult);
      const name = parsedResult.recognized_names[0];

      const sql = "SELECT f_name, l_name FROM login WHERE emp_id = ?";
      db.query(sql, [name], (err, data) => {
        if (err) {
          console.error("Error fetching profile data:", err);
          // Send error response only if not already sent
          if (!res.headersSent) {
            res.status(500).json({ status: "error", message: "Failed to retrieve profile data" });
          }
          return;
        }

        if (data.length > 0) {
          console.log("Data:", data);
          if (!res.headersSent) {
            res.json({ status: "success", details: data[0] });
          }
        } else {
          if (!res.headersSent) {
            res.status(404).json({ status: "error", message: "User not found" });
          }
        }
      });
    } catch (error) {
      console.error("Error parsing Python output:", error);
      if (!res.headersSent) {
        res.status(500).json({ status: "error", message: "Invalid Python response" });
      }
    }
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Python Error: ${data}`);
  });

  pythonProcess.on("close", (code) => {
    console.log(`Python process exited with code ${code}`);
    pythonProcess = null; // Reset the variable when the process exits
  });
});


app.post('/stop-recognition', (req, res) => {
  if (pythonProcess) {
    pythonProcess.kill('SIGINT'); // Send interrupt signal
    pythonProcess = null; // Reset the variable
    res.status(200).send({ message: 'Recognition stopped' });
  } else {
    console.warn("Attempted to stop recognition, but no process was running.");
    res.status(400).send({ message: 'Recognition is not running' });
  }
});




// Register route without photo upload
app.post('/register', upload.single('file'), (req, res) => {
    const { firstName, lastName, email, password, phone1, phone2, position, roleDescription } = req.body;
    const filename = req.file ? req.file.filename : null; // Ensure filename is retrieved from multer

    // Check if the email already exists
    const checkEmailSql = "SELECT * FROM login WHERE email = ?";
    db.query(checkEmailSql, [email], (err, results) => {
        if (err) {
            console.error(err);
            return res.json({ status: "error", message: "Error checking email" });
        }
        if (results.length > 0) {
            // Email already exists
            return res.json({ status: "error", message: "Email already exists. Please use a different email." });
        }

        // If email doesn't exist, proceed with registration
        const sql = "INSERT INTO login (f_name, l_name, email, password, c_number, e_number, position, photo, description) VALUES (?)";
        const values = [
            firstName,
            lastName,
            email,
            password,
            phone1,
            phone2,
            position,
            filename,
            roleDescription,
        ];

        db.query(sql, [values], (err, result) => {
            if (err) {
                console.error(err);
                return res.json({ status: "error", message: "Registration failed" });
            }
            res.json({ status: "success", message: "User registered successfully" });
        });
    });
});


app.post('/login', (req, res) => {
    console.log("Request body:", req.body);
    const { email, password } = req.body;
    console.log("Login request received:", { email, password });

    const sql = "SELECT * FROM login WHERE email = ?";
    console.log("Executing SQL query:", sql, [email]);

    db.query(sql, [email], (err, data) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.json({ status: "error", message: "Login failed" });
        }

        console.log("Query result:", data);

        if (data.length > 0) {
            const user = data[0];
            const storedPassword = user.password;  

            if (storedPassword === password) {  
                // Generate JWT token
                const token = jwt.sign({ emp_id: user.emp_id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
                return res.json({
                    status: "success", 
                    message: "Login successful", 
                    token,
                    data: { user, emp_id: user.emp_id, role: user.role }
                });
            } else {
                return res.json({ status: "error", message: "Invalid credentials" });
            }
        } else {
            return res.json({ status: "error", message: "Invalid credentials" });
        }
    });
});


const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ status: "error", message: "Access denied. No token provided." });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ status: "error", message: "Invalid token." });
        }
        req.emp_id = decoded.emp_id;
        next();
    });
};

app.get('/profile/:emp_id', verifyToken, (req, res) => {
    const emp_id = req.emp_id;

    const sql = "SELECT * FROM login WHERE emp_id = ?";
    db.query(sql, [emp_id], (err, data) => {
        if (err) {
            console.error("Error fetching profile data:", err);
            return res.json({ status: "error", message: "Failed to retrieve profile data" });
        }

        if (data.length > 0) {
            return res.json({ status: "success", data: data[0] });
        } else {
            return res.json({ status: "error", message: "User not found" });
        }
    });
});



//manage employee
app.get('/admin/manage-employee', (req, res) => {
  const sql = `
    SELECT 
      login.emp_id, login.f_name, login.l_name, login.position, login.c_number, login.e_number, login.email, 
      leave_count.annual_leave_count, leave_count.cassual_leave_count, leave_count.annual_leave_taken, 
      leave_count.cassual_leave_taken, leave_count.nopay_leave_taken
    FROM login
    LEFT JOIN leave_count ON login.emp_id = leave_count.emp_id
  `;

  db.query(sql, (err, data) => {
      if (err) {
          console.error("Error fetching employee data:", err);
          return res.json({ status: "error", message: "Failed to retrieve employee data" });
      }

      if (data.length > 0) {
        console.log('gggggggg',data)
          return res.json({ status: "success", data: data });
      } else {
        console.log('fffffff')
          return res.json({ status: "error", message: "No employees found" });
      }
  });
});




app.delete('/admin/manage-employee/:empId', (req, res) => {
  const empId = req.params.empId;

  const deleteAttendanceSql = "DELETE FROM attendance WHERE emp_id = ?";
  const deleteEmployeeLeaveSql = "DELETE FROM employee_leave WHERE emp_id = ?";
  const deleteLeaveRequestsSql = "DELETE FROM leave_requests WHERE emp_id = ?";
  const deleteLoginSql = "DELETE FROM login WHERE emp_id = ?";
  const deleteLeaveCountSql = "DELETE FROM leave_count WHERE emp_id = ?";

  db.beginTransaction((err) => {
    if (err) {
      console.error("Error starting transaction:", err);
      return res.json({ status: "error", message: "Failed to start transaction" });
    }

    db.query(deleteAttendanceSql, [empId], (err, data) => {
      if (err) {
        return db.rollback(() => {
          console.error("Error deleting from attendance:", err);
          return res.json({ status: "error", message: "Failed to delete attendance data" });
        });
      }

      db.query(deleteEmployeeLeaveSql, [empId], (err, data) => {
        if (err) {
          return db.rollback(() => {
            console.error("Error deleting from employee_leave:", err);
            return res.json({ status: "error", message: "Failed to delete employee leave data" });
          });
        }

        db.query(deleteLeaveRequestsSql, [empId], (err, data) => {
          if (err) {
            return db.rollback(() => {
              console.error("Error deleting from leave_requests:", err);
              return res.json({ status: "error", message: "Failed to delete leave requests data" });
            });
          }

          db.query(deleteLeaveCountSql, [empId], (err, data) => {
            if (err) {
              return db.rollback(() => {
                console.error("Error deleting from leave_count:", err);
                return res.json({ status: "error", message: "Failed to delete leave count data" });
              });
            }

            db.query(deleteLoginSql, [empId], (err, data) => {
              if (err) {
                return db.rollback(() => {
                  console.error("Error deleting from login:", err);
                  return res.json({ status: "error", message: "Failed to delete login data" });
                });
              }

              db.commit((err) => {
                if (err) {
                  return db.rollback(() => {
                    console.error("Error committing transaction:", err);
                    return res.json({ status: "error", message: "Failed to commit transaction" });
                  });
                }

                return res.json({ status: "success", message: "Employee and all related data deleted successfully" });
              });
            });
          });
        });
      });
    });
  });
});

  

// UPDATE user route
app.put('/admin/manage-employee/:empId', (req, res) => {
  const empId = req.params.empId;
  console.log('daaaaa',req.body)
  const { emp_id,position,c_number,e_number,annual_leave_count,cassual_leave_count,email } = req.body;
  console.log(emp_id,position,c_number,e_number,annual_leave_count,cassual_leave_count,email);

  // Update login table
  const updateLoginSql = `
    UPDATE login SET position = ?, c_number = ?, e_number = ?, email = ? WHERE emp_id = ?
  `;
  
  // Check if the employee exists in leave_count table
  const checkLeaveCountSql = `
    SELECT * FROM leave_count WHERE emp_id = ?
  `;

  // Insert new data if employee does not exist in leave_count table
  const insertLeaveCountSql = `
    INSERT INTO leave_count (emp_id, annual_leave_count, cassual_leave_count) 
    VALUES (?, ?, ?)
  `;

  // Update leave_count table
  const updateLeaveCountSql = `
    UPDATE leave_count SET annual_leave_count = ?, cassual_leave_count = ? WHERE emp_id = ?
  `;

  db.beginTransaction((err) => {
    if (err) {
      console.log('hello0')
      console.error("Error starting transaction:", err);
      return res.json({ status: "error", message: "Failed to start transaction" });
    }

    db.query(updateLoginSql, [position, c_number, e_number, email, emp_id], (err, data) => {
      if (err) {
        console.log('hello1')
        return db.rollback(() => {
          console.error("Error updating login table:", err);
          return res.json({ status: "error", message: "Failed to update login data" });
        });
      }

      // First, check if the employee exists in leave_count table
      db.query(checkLeaveCountSql, [emp_id], (err, results) => {
        if (err) {
          console.log('hello2')
          return db.rollback(() => {
            console.error("Error checking leave_count table:", err);
            return res.json({ status: "error", message: "Failed to check leave count data" });
          });
        }

        if (results.length > 0) {
          // Employee exists, so update leave_count table
          db.query(updateLeaveCountSql, [annual_leave_count, cassual_leave_count, emp_id], (err, data) => {
            if (err) {
              console.log('hello3')
              return db.rollback(() => {
                console.error("Error updating leave_count table:", err);
                return res.json({ status: "error", message: "Failed to update leave count data" });
              });
            }
          });
        } else {
          // Employee does not exist, so insert new record into leave_count table
          db.query(insertLeaveCountSql, [emp_id, annual_leave_count, cassual_leave_count], (err, data) => {
            if (err) {
              console.log('hello4')
              return db.rollback(() => {
                console.error("Error inserting leave_count data:", err);
                return res.json({ status: "error", message: "Failed to insert leave count data" });
              });
            }
          });
        }

        db.commit((err) => {
          if (err) {
            console.log('hello5')
            return db.rollback(() => {
              console.error("Error committing transaction:", err);
              return res.json({ status: "error", message: "Failed to commit transaction" });
            });
          }
console.log('hello6')
          return res.json({ status: "success", message: "Employee data updated successfully" });
        });
      });
    });
  });
});

 // Submit leave request
 app.post('/leave', (req, res) => {
  const { emp_id, leaveType, reason, startDate, endDate, representative } = req.body;

  if (!emp_id || !leaveType || !startDate || !endDate || (!reason && leaveType === 'normal')) {
      return res.status(400).json({ status: "error", message: "Missing required fields" });
  }

  let sql, values;

  if (leaveType !== 'normal') {
      // SQL query for non-normal leave type
      sql = "INSERT INTO leave_requests (emp_id, leave_type, first_day, last_day, representative) VALUES (?, ?, ?, ?, ?)";
      values = [emp_id, leaveType, startDate, endDate, representative];
  } else {
      // SQL query for normal leave type
      sql = "INSERT INTO leave_requests (emp_id, leave_type, reason, first_day, last_day, representative) VALUES (?, ?, ?, ?, ?, ?)";
      values = [emp_id, leaveType, reason, startDate, endDate, representative];
  }

  // Execute the query
  db.query(sql, values, (err, result) => {
      if (err) {
          console.error("Error inserting leave request:", err);
          return res.status(500).json({ status: "error", message: "Failed to submit leave request" });
      }
      // Successfully inserted
      res.json({ status: "success", message: "Leave request submitted successfully" });
  });
});


// Backend API route to fetch employee names
app.get('/leave/:emp_id', (req, res) => {
  const emp_id1 = req.params.emp_id;
  console.log('iddddd', emp_id1);

  const sql1 = `SELECT 
    login.emp_id, 
    login.f_name, 
    login.l_name, 
    COALESCE(leave_count.annual_leave_count, 0) AS annual_leave_count,
    COALESCE(leave_count.cassual_leave_count, 0) AS cassual_leave_count, 
    COALESCE(leave_count.annual_leave_taken, 0) AS annual_leave_taken, 
    COALESCE(leave_count.cassual_leave_taken, 0) AS cassual_leave_taken
  FROM login
  LEFT JOIN leave_count ON login.emp_id = leave_count.emp_id
  WHERE login.emp_id != ?`;

  db.query(sql1, [emp_id1], (err, results1) => {
    if (err) {
      console.error("Error fetching employees:", err);
      return res.status(500).json({ status: "error", message: "Failed to fetch employees" });
    }

    if (results1.length === 0) {
      return res.status(404).json({ status: "error", message: "No employees found" });
    }

    // Now run the second query
    const sql2 = `SELECT 
    login.emp_id, 
    COALESCE(leave_count.nopay_leave_taken, 0) AS nopay_leave_taken,
    COALESCE(leave_count.annual_leave_count, 0) AS annual_leave_count,
    COALESCE(leave_count.cassual_leave_count, 0) AS cassual_leave_count, 
    COALESCE(leave_count.annual_leave_taken, 0) AS annual_leave_taken, 
    COALESCE(leave_count.cassual_leave_taken, 0) AS cassual_leave_taken
  FROM login
  LEFT JOIN leave_count ON login.emp_id = leave_count.emp_id
  WHERE login.emp_id = ?`; // Example query
    db.query(sql2, [emp_id1], (err, results2) => {
      if (err) {
        console.error("Error fetching additional data:", err);
        return res.status(500).json({ status: "error", message: "Failed to fetch additional data" });
      }

      console.log('Employee Data:', results1);
      console.log('Additional Data:', results2);

      res.json({ status: "success", data: { employees: results1, additionalData: results2 } });
    });
  });
});



  
app.get('/admin/requests', (req, res) => {
    const sql = `
    SELECT leave_requests.*, login.f_name, login.l_name
    FROM leave_requests
    LEFT JOIN login ON leave_requests.emp_id = login.emp_id;
    `;
    db.query(sql, (err, data) => {
      if (err) {
        console.error("Error fetching leave requests:", err);
        return res.json({ status: "error", message: "Failed to retrieve leave requests" });
      }
  
      if (data.length > 0) {
        console.log("Data retrieved:", data); // Add this line to log data
        return res.json({ status: "success", data: data });
      } else {
        return res.json({ status: "error", message: "No leave requests found" });
      }
    });
  });



  app.post('/admin/requests', (req, res) => {
    let { leave_request_id, emp_id,first_day, last_day, representative,reason = '',leave_type,f_name,l_name, name,  days } = req.body;
  
    console.log('Leave request body:', req.body);
  
    // Step 1: Insert into employee_leave table
    const sqlApprove = `
      INSERT INTO employee_leave (emp_id, leave_type, first_day, last_day, days, representative, reason )
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
    const values = [emp_id, leave_type, first_day, last_day, days, representative, reason];
  
    db.query(sqlApprove, values, (err, result) => {
      if (err) {
        console.error("Error inserting into employee_leave:", err);
        return res.status(500).json({ status: "error", message: "Failed to approve leave request" });
      }
  
      console.log('Leave request inserted into employee_leave:', result);
  
      // Step 2: Delete the leave request from leave_requests table
      if (!leave_request_id) {
        console.error("Leave request ID is missing");
        return res.status(400).json({ status: "error", message: "Leave request ID is required" });
      }
  
      const sqlDeleteRequest = `DELETE FROM leave_requests WHERE leave_request_id = ?`;
      db.query(sqlDeleteRequest, [leave_request_id], (deleteErr, deleteResult) => {
        if (deleteErr) {
          console.error("Error deleting approved leave request:", deleteErr);
          return res.status(500).json({ status: "error", message: "Failed to delete approved leave request" });
        }
  
        console.log('Leave request deleted from leave_requests:', deleteResult);
  
        // Step 3: Check if leave_count record exists for emp_id
        const checkLeaveCountSql = `SELECT * FROM leave_count WHERE emp_id = ?`;
        db.query(checkLeaveCountSql, [emp_id], (checkErr, checkResult) => {
          if (checkErr) {
            console.error("Error checking leave_count:", checkErr);
            return res.status(500).json({ status: "error", message: "Failed to check leave count" });
          }
  
          if (checkResult.length === 0) {
            // Insert a new record for emp_id if none exists
            const insertLeaveCountSql = `
              INSERT INTO leave_count (emp_id, casual_leave_taken, annual_leave_taken, nopay_leave_taken)
              VALUES (?, 0, 0, 0);
            `;
            db.query(insertLeaveCountSql, [emp_id], (insertErr, insertResult) => {
              if (insertErr) {
                console.error("Error inserting into leave_count:", insertErr);
                return res.status(500).json({ status: "error", message: "Failed to create leave count record" });
              }
  
              console.log('New leave count record created for emp_id:', emp_id);
              updateLeaveCount();
            });
          } else {
            updateLeaveCount();
          }
  
          // Step 4: Update leave_count based on leave type
             // Define updateLeaveCount outside the conditional logic
             function updateLeaveCount() {
              if (leave_type === 'normal'|| leave_type==='Normal Leave'|| leave_type==='Normal'|| leave_type==='normal leave') {
                let updateLeaveCountSql = '';
                let updateValues = [];
    
                switch (reason) {
                  case 'Casual Leave':
                    updateLeaveCountSql = `
                      UPDATE leave_count 
                      SET cassual_leave_taken = COALESCE(cassual_leave_taken, 0) + ? 
                      WHERE emp_id = ?
                    `;
                    updateValues = [days, emp_id];
                    break;
                  case 'Annual Leave':
                    updateLeaveCountSql = `
                      UPDATE leave_count 
                      SET annual_leave_taken = COALESCE(annual_leave_taken, 0) + ? 
                      WHERE emp_id = ?
                    `;
                    updateValues = [days, emp_id];
                    break;
                  case 'No Pay Leave':
                    updateLeaveCountSql = `
                      UPDATE leave_count 
                      SET nopay_leave_taken = COALESCE(nopay_leave_taken, 0) + ? 
                      WHERE emp_id = ?
                    `;
                    updateValues = [days, emp_id];
                    break;
                  default:
                    console.error("Invalid leave reason:", reason);
                    return res.status(400).json({ status: "error", message: "Invalid leave reason" });
                }
    
                db.query(updateLeaveCountSql, updateValues, (updateErr, updateResult) => {
                  if (updateErr) {
                    console.error("Error updating leave count:", updateErr);
                    return res.status(500).json({ status: "error", message: "Failed to update leave count" });
                  }
    
                  console.log('Leave count updated:', updateResult);
    
                  // Final response
                  res.json({ status: "success", message: "Leave request approved and leave count updated successfully" });
                });
              } else {
                console.log('Leave type not Normal');
                res.json({ status: "success", message: "Leave request approved successfully" });
              }
            }
          });
        });
      });
    });
  
app.delete('/admin/requests/:id', (req, res) => {
    const leave_request_id = req.params.id;

    const sqlReject = `DELETE FROM leave_requests WHERE leave_request_id = ?`;
    db.query(sqlReject, [leave_request_id], (err, result) => {
        if (err) {
            console.error("Error rejecting leave request:", err);
            return res.status(500).json({ status: "error", message: "Failed to reject leave request" });
        }

        if (result.affectedRows > 0) {
            res.json({ status: "success", message: "Leave request rejected and deleted successfully" });
        } else {
            res.status(404).json({ status: "error", message: "Leave request not found" });
        }
    });
});

// In your app.js or server file
app.get('/hr/leave', (req, res) => {
    // First query to fetch leave data
    const leaveSql = `
      SELECT emp_id, leave_type, reason, first_day, last_day, days, representative
      FROM employee_leave;
    `;
    
    db.query(leaveSql, (err, leaveData) => {
      if (err) {
        console.error("Error fetching leave data:", err);
        return res.json({ status: "error", message: "Failed to retrieve leave data" });
      }
  
      // If leave data is retrieved successfully
      if (leaveData.length > 0) {
        // Second query to fetch employee names based on emp_id
        const empIds = leaveData.map(item => item.emp_id).join(',');
        
        const nameSql = `
          SELECT emp_id, f_name, l_name
          FROM login
          WHERE emp_id IN (${empIds});
        `;
        
        db.query(nameSql, (err, nameData) => {
          if (err) {
            console.error("Error fetching employee names:", err);
            return res.json({ status: "error", message: "Failed to retrieve employee names" });
          }
  
          // Combine leave data with the employee names
          const finalData = leaveData.map(leaveItem => {
           
            const employee = nameData.find(emp => emp.emp_id === leaveItem.emp_id);
            if (employee) {
              // Add the full name to the leave data
              
              leaveItem.name = `${employee.f_name} ${employee.l_name}`;
            } else {
              
              // If no matching employee is found, set the name to 'Unknown'
              leaveItem.name = 'Unknown';
            }
            return leaveItem;
          });
  
          // Return the combined data
          return res.json({ status: "success", data: finalData });
        });
      } else {
        
        return res.json({ status: "error", message: "No leave requests found" });
      }
    });
  });

  // Backend API route to fetch employee names
  app.get('/history/:emp_id', (req, res) => {
    const emp_id = req.params.emp_id; // Correctly access the emp_id from params
    // console.log('Employee ID:', emp_id);
  
    const sql = "SELECT leave_type, first_day, last_day, days, reason, representative FROM employee_leave WHERE emp_id=?";
    db.query(sql, [emp_id], (err, results) => {
      if (err) {
        console.error("Error fetching employees:", err);
        return res.status(500).json({ status: "error", message: "Failed to fetch employees" });
      }
      console.log('Data fetched successfully');
      res.json({ status: "success", data: results });
    });
  });



  app.get('/dashboard/:emp_id', (req, res) => {
    const emp_id = req.params.emp_id; // Change req.emp_id to req.params.emp_id

    const sql = "SELECT * FROM leave_count WHERE emp_id = ?";

    db.query(sql, [emp_id], (err, data) => {
        if (err) {
            console.error("Error fetching profile data:", err);
            return res.json({ status: "error", message: "Failed to retrieve profile data" });
        }

        if (data.length > 0) {
            // Replace any null values with 0
            const processedData = Object.fromEntries(
                Object.entries(data[0]).map(([key, value]) => [key, value === null ? 0 : value])
            );

            return res.json({ status: "success", data: processedData });
        } else {
        
            return res.json({ status: "error", message: "User not found" });
        }
    });
});

app.get('/admin/leave-plan', (req, res) => {

  const sql = "SELECT emp_id, f_name, l_name FROM login ";
  db.query(sql, (err, data) => {
      if (err) {
          console.error("Error fetching profile data:", err);
          return res.json({ status: "error", message: "Failed to retrieve profile data" });
      }

      if (data.length > 0) {
        console.log('data',data)
          return res.json({ status: "success", data: data });

      } else {
        console.log('no')
          return res.json({ status: "error", message: "User not found" });
      }
  });
}); 

// app.get('/update-leave/:emp_id', (req, res) => {
//   const emp_id = req.params.emp_id;

//   const sql = "SELECT * FROM leave_requests WHERE emp_id = ?";
//   db.query(sql, [emp_id], (err, data) => {
//       if (err) {
//           console.error("Error fetching profile data:", err);
//           return res.json({ status: "error", message: "Failed to retrieve profile data" });
//       }

//       if (data.length > 0) {
//         console.log('data',data)
//           return res.json({ status: "success", data: data });

//       } else {
//         console.log('no')
//           return res.json({ status: "error", message: "User not found" });
//       }
//   });
// }); 

app.get('/update-leave/:emp_id', (req, res) => {
  const emp_id = req.params.emp_id;

  const leaveRequestsQuery = "SELECT * FROM leave_requests WHERE emp_id = ?";
  const employeeDetailsQuery = "SELECT * FROM employee_leave WHERE emp_id = ?";

  // Execute the first query
  db.query(leaveRequestsQuery, [emp_id], (err1, leaveData) => {
    console.log(leaveData)
    if (err1) {
      console.error("Error fetching leave data:", err1);
      return res.json({ status: "error", message: "Failed to retrieve leave data" });
    }
    // Execute the second query inside the callback of the first query
    db.query(employeeDetailsQuery, [emp_id], (err2, employeeData) => {
      if (err2) {
        console.error("Error fetching employee data:", err2);
        return res.json({ status: "error", message: "Failed to retrieve employee data" });
      }

      // Both queries are successful, send the combined data
      return res.json({
        status: "success",
        leaveData: leaveData,
        employeeData: employeeData,
      });
    });
  });
});

app.post('/update-leave', (req, res) => {

  const { emp_id ,leave_id, old_first_day, startDate, old_last_day, endDate, old_representative, representative, old_reason, reason, old_leave_type, leaveType,action } = req.body;
 
console.log('request',req.body)
  // Define the SQL query for inserting a new leave request
  const sql = "INSERT INTO leave_update ( emp_id ,leave_id, old_first_day, first_day, old_last_day, last_day, old_representative, representative, old_reason, reason, old_leave_type, leave_type,action) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
  
  // Create an array with the values to insert
  const values = [ emp_id ,leave_id, old_first_day, startDate, old_last_day, endDate, old_representative, representative, old_reason, reason, old_leave_type, leaveType,action];

  // Execute the query
  db.query(sql, values, (err, result) => {
      if (err) {
          console.error("Error inserting leave request:", err);
          return res.status(500).json({ status: "error", message: "Failed to submit leave request" });
      }
      // Successfully inserted
      console.log('done')
      res.json({ status: "success", message: "Leave request submitted successfully" });
  });
});


app.put('/update-leave/:id', (req, res) => {
  console.log('data',req.body)
  const { startDate, endDate, representative, reason, leaveType } = req.body;
  const leave_request_id = req.params.id; // Retrieve `id` from the URL parameters

  // Validate input
  if (!leave_request_id) {
    return res.status(400).json({ status: "error", message: "leave_id is required." });
  }

  // SQL query and values
  const sql = `
    UPDATE leave_requests
    SET 
      first_day = ?,
      last_day = ?,
      representative = ?,
      reason = ?,
      leave_type = ?
    WHERE leave_request_id = ?
  `;
  const values = [startDate, endDate, representative, reason, leaveType, leave_request_id];
  console.log(values)

  // Execute the query
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating leave request:", err);
      return res.status(500).json({ status: "error", message: "Failed to update leave request" });
    }

    if (result.affectedRows > 0) {
      res.json({ status: "success", message: "Leave updated successfully." });
    } else {
      res.status(404).json({ status: "error", message: "Leave record not found." });
    }
  });
});


app.delete('/update-leave-request/:id', (req, res) => {
  
  const leave_request_id = req.params.id;

  const sqlReject = `DELETE FROM leave_requests WHERE leave_request_id = ?`;
  db.query(sqlReject, [leave_request_id], (err, result) => {
      if (err) {
          console.error("Error rejecting leave request:", err);
          return res.status(500).json({ status: "error", message: "Failed to reject leave request" });
      }

      if (result.affectedRows > 0) {
          res.json({ status: "success", message: "Leave request rejected and deleted successfully" });
      } else {
          res.status(404).json({ status: "error", message: "Leave request not found" });
      }
  });
});


app.post('/update-approved-leave', (req, res) => {

  const { emp_id ,leave_id, first_day,last_day, representative, reason, leave_type, action } = req.body;
 
console.log('request',req.body)
  // Define the SQL query for inserting a new leave request
  const sql = "INSERT INTO leave_update ( emp_id ,leave_id, old_first_day, old_last_day, old_representative, old_reason, old_leave_type, action) VALUES (?,?,?,?,?,?,?,?)";
  
  // Create an array with the values to insert
  const values = [  emp_id ,leave_id, first_day,last_day, representative, reason, leave_type, action];

  // Execute the query
  db.query(sql, values, (err, result) => {
      if (err) {
          console.error("Error inserting leave request:", err);
          return res.status(500).json({ status: "error", message: "Failed to submit leave request" });
      }
      // Successfully inserted
      console.log('done')
      res.json({ status: "success", message: "Leave request submitted successfully" });
  });
});

app.get('/admin/leave-update', (req, res) => {
  const sql = `
  SELECT lu.*, l.f_name, l.l_name FROM leave_update lu JOIN login l ON lu.emp_id = l.emp_id;
  `;

  db.query(sql, (err, data) => {
      if (err) {
          console.error("Error fetching employee data:", err);
          return res.json({ status: "error", message: "Failed to retrieve employee data" });
      }

      if (data.length > 0) {
          return res.json({ status: "success", data: data });
      } else {
          return res.json({ status: "error", message: "No employees found" });
      }
  });
});

app.delete('/admin/leave-cancel/:id', (req, res) => {
  
  const l_u_id = req.params.id;

  const sqlReject = `DELETE FROM leave_update WHERE l_u_id = ?`;
  db.query(sqlReject, [l_u_id], (err, result) => {
      if (err) {
          console.error("Error rejecting leave request:", err);
          return res.status(500).json({ status: "error", message: "Failed to reject leave request" });
      }

      if (result.affectedRows > 0) {
          res.json({ status: "success", message: "Leave request rejected and deleted successfully" });
      } else {
          res.status(404).json({ status: "error", message: "Leave request not found" });
      }
  });
});

app.delete('/admin/leave-cancel-cancel/:id', (req, res) => {
  
  const leave_id = req.params.id;

  const sqlReject = `DELETE FROM employee_leave WHERE leave_id = ?`;
  db.query(sqlReject, [leave_id], (err, result) => {
      if (err) {
          console.error("Error rejecting leave request:", err);
          return res.status(500).json({ status: "error", message: "Failed to reject leave request" });
      }

      if (result.affectedRows > 0) {
          res.json({ status: "success", message: "Leave request rejected and deleted successfully" });
      } else {
          res.status(404).json({ status: "error", message: "Leave request not found" });
      }
  });
});


// PUT Endpoint to Update Leave Count
app.put('/admin/leave-cancel-cancel/:empId', (req, res) => {
  const empId = req.params.empId;
  const { reason, days } = req.body;

  if (!['Casual Leave', 'Annual Leave', 'No Pay Leave'].includes(reason)) {
    return res.status(400).send({ message: 'Invalid leave reason.' });
  }

  // Query to get the current leave count
  let leaveTypeColumn;
  if (reason === 'Annual Leave') leaveTypeColumn = 'annual_leave_taken';
  else if (reason === 'Casual Leave') leaveTypeColumn = 'cassual_leave_taken';
  else if (reason === 'No Pay Leave') leaveTypeColumn = 'nopay_leave_taken';

  const getLeaveQuery = `SELECT ${leaveTypeColumn} FROM leave_count WHERE emp_id = ?`;
  db.query(getLeaveQuery, [empId], (err, results) => {
    if (err) {
      console.error('Error fetching leave data:', err);
      return res.status(500).send({ message: 'Database error.' });
    }

    if (results.length === 0) {
      return res.status(404).send({ message: 'Employee not found.' });
    }

    const currentLeaveCount = results[0][leaveTypeColumn];
    const updatedLeaveCount = currentLeaveCount - days;

    // Ensure leave count does not go negative
    if (updatedLeaveCount < 0) {
      return res.status(400).send({ message: 'Leave count cannot be negative.' });
    }

    // Query to update the leave count
    const updateLeaveQuery = `UPDATE leave_count SET ${leaveTypeColumn} = ? WHERE emp_id = ?`;
    db.query(updateLeaveQuery, [updatedLeaveCount, empId], (err, updateResults) => {
      if (err) {
        console.error('Error updating leave data:', err);
        return res.status(500).send({ message: 'Database error.' });
      }

      res.status(200).send({
        message: 'Leave count updated successfully.',
        updatedLeaveCount
      });
    });
  });
});

app.put('/admin/leave-approve/:empId', (req, res) => {
  const empId = req.params.empId;
  console.log('emp idddd',empId)
  const { old_reason,reason,old_days, days } = req.body;

  if (!['Casual Leave', 'Annual Leave', 'No Pay Leave'].includes(old_reason)) {
    console.log('kkkkkkk 1')
    return res.status(400).send({ message: 'Invalid leave reason.' });
  }

  // Query to get the current leave count
  let leaveTypeColumn;
  if (old_reason === 'Annual Leave') leaveTypeColumn = 'annual_leave_taken';
  else if (old_reason === 'Casual Leave') leaveTypeColumn = 'cassual_leave_taken';
  else if (old_reason === 'No Pay Leave') leaveTypeColumn = 'nopay_leave_taken';

  const getLeaveQuery = `SELECT ${leaveTypeColumn} FROM leave_count WHERE emp_id = ?`;
  db.query(getLeaveQuery, [empId], (err, results) => {
    console.log('kkkkkkk 2')
    if (err) {
      console.error('Error fetching leave data:', err);
      return res.status(500).send({ message: 'Database error.' });
    }

    if (results.length === 0) {
      console.log('kkkkkkk 3')
      return res.status(404).send({ message: 'Employee not found.' });
    }

    const currentLeaveCount = results[0][leaveTypeColumn];
    const updatedLeaveCount = currentLeaveCount - old_days;
console.log('nnnnnnnnnn')
    // Ensure leave count does not go negative
    if (updatedLeaveCount < 0) {
      console.log('kkkkkkk 4')
      return res.status(400).send({ message: 'Leave count cannot be negative.' });
    }

    // Query to update the leave count
    const updateLeaveQuery = `UPDATE leave_count SET ${leaveTypeColumn} = ? WHERE emp_id = ?`;
    db.query(updateLeaveQuery, [updatedLeaveCount, empId], (err, updateResults) => {
      if (err) {

        console.error('Error updating leave data:', err);
        return res.status(500).send({ message: 'Database error.' });
      }
console.log('jjjjjjjjjjj')
      // res.status(200).send({
      //   message: 'Leave count updated successfully.',
      //   updatedLeaveCount
      // });
    });
  });

  if (!['Casual Leave', 'Annual Leave', 'No Pay Leave'].includes(reason)) {
    console.log('ssssssssss')
    return res.status(400).send({ message: 'Invalid leave reason.' });
  }
console.log('ccccccccccccccc')
  // Query to get the current leave count
  let leaveTypeColumnNew;
  if (reason === 'Annual Leave') leaveTypeColumnNew = 'annual_leave_taken';
  else if (reason === 'Casual Leave') leaveTypeColumnNew = 'cassual_leave_taken';
  else if (reason === 'No Pay Leave') leaveTypeColumnNew = 'nopay_leave_taken';
console.log('ooooooooooooo')
  const getLeaveQueryNew = `SELECT ${leaveTypeColumnNew} FROM leave_count WHERE emp_id = ?`;
  db.query(getLeaveQueryNew, [empId], (err, results) => {
    if (err) {
      console.error('Error fetching leave data:', err);
      return res.status(500).send({ message: 'Database error.' });
    }

    if (results.length === 0) {
      console.log('kkkkkkk 5')
      return res.status(404).send({ message: 'Employee not found.' });
    }

    const currentLeaveCountNew = results[0][leaveTypeColumnNew];
    const updatedLeaveCountNew = currentLeaveCountNew + days;
console.log('ppppppppppppp')
    // Ensure leave count does not go negative
    if (updatedLeaveCountNew < 0) {
      console.log('kkkkkkk 6')
      return res.status(400).send({ message: 'Leave count cannot be negative.' });
    }

    // Query to update the leave count
    const updateLeaveQueryNew = `UPDATE leave_count SET ${leaveTypeColumnNew} = ? WHERE emp_id = ?`;
    console.log('dddddddddd')
    db.query(updateLeaveQueryNew, [updatedLeaveCountNew, empId], (err, updateResults) => {
      if (err) {
        console.error('Error updating leave data:', err);
        return res.status(500).send({ message: 'Database error.' });
      }

      res.status(200).send({
        message: 'Leave count updated successfully.',
        updatedLeaveCountNew
      });
    });
  });
});



app.put('/admin/leave-approve-approve/:id', (req, res) => {
  console.log('data',req.body)
  const {leave_type,first_day,last_day,days,representative,reason} = req.body;
  const leave_id = req.params.id; // Retrieve `id` from the URL parameters
console.log('IDDDDDD',leave_id)
  // Validate input
  if (!leave_id) {
    return res.status(400).json({ status: "error", message: "leave_id is required." });
  }

  // SQL query and values
  const sql = `
    UPDATE employee_leave
    SET 
    leave_type = ?,
      first_day = ?,
      last_day = ?,
      days = ?,
      representative = ?,
      reason = ?
      
    WHERE leave_id = ?
  `;
  const values = [leave_type,first_day,last_day,days,representative,reason,leave_id];
  console.log(values)

  // Execute the query
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating leave request:", err);
      return res.status(500).json({ status: "error", message: "Failed to update leave request" });
    }

    if (result.affectedRows > 0) {
      res.json({ status: "success", message: "Leave updated successfully." });
    } else {
      res.status(404).json({ status: "error", message: "Leave record not found." });
    }
  });
});


app.get('/attendance/:emp_id', (req, res) => {
  const emp_id = req.params.emp_id;
console.log('helooo 1', emp_id)
  const sql = "SELECT * FROM attendance WHERE emp_id = ?";
  db.query(sql, [emp_id], (err, data) => {
      if (err) {
          console.error("Error fetching profile data:", err);
          return res.json({ status: "error", message: "Failed to retrieve profile data" });
      }

      if (data.length > 0) {
        console.log('helooo 2')
          return res.json({ status: "success", data: data });
      } else {
        console.log('helooo 3')
          return res.json({ status: "error", message: "User not found" });
      }
  });
});

app.post('/attendance-update', (req, res) => {
  const { attendance_id, emp_id, date, sign_in, sign_out, action, old_date, old_sign_in, old_sign_out } = req.body;

  console.log('Request received:', req.body);

  // Declare variables to hold SQL query and values
  let sql;
  let values;

  if (action === 'update') {
    // Query and values for an update action
    sql = "INSERT INTO attendance_update (attendance_id, emp_id, date, sign_in, sign_out, action, old_date, old_sign_in, old_sign_out) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    values = [attendance_id, emp_id, date, sign_in, sign_out, action, old_date, old_sign_in, old_sign_out];
  } else if (action === 'delete') {
    // Query and values for a delete action
    sql = "INSERT INTO attendance_update (attendance_id, emp_id, action, old_date, old_sign_in, old_sign_out) VALUES (?, ?, ?, ?, ?, ?)";
    values = [attendance_id, emp_id, action, old_date, old_sign_in, old_sign_out];
  } else {
    // Handle invalid action
    return res.status(400).json({ status: "error", message: "Invalid action type" });
  }

  // Execute the query
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error inserting attendance update request:", err);
      return res.status(500).json({ status: "error", message: "Failed to submit attendance update request" });
    }
    // Successfully inserted
    console.log('Request processed successfully');
    res.json({ status: "success", message: "Attendance update request submitted successfully" });
  });
});

app.get('/hr/attendance', (req, res) => {
  const sql = "SELECT att.*, l.f_name, l.l_name FROM attendance att JOIN login l ON att.emp_id = l.emp_id;";
  db.query(sql, (err, data) => {
      if (err) {
          console.error("Error fetching profile data:", err);
          return res.json({ status: "error", message: "Failed to retrieve profile data" });
      }

      if (data.length > 0) {
        console.log('success')
          return res.json({ status: "success", data: data });
      } else {
          return res.json({ status: "error", message: "User not found" });
      }
  });
});

app.get('/admin/attendance-update', (req, res) => {
  
  const sql = "SELECT att_up.*, l.f_name, l.l_name FROM attendance_update att_up JOIN login l ON att_up.emp_id = l.emp_id;";
  db.query(sql, (err, data) => {
      if (err) {
          console.error("Error fetching profile data:", err);
          return res.json({ status: "error", message: "Failed to retrieve profile data" });
      }

      if (data.length > 0) {
        
          return res.json({ status: "success", data: data });
      } else {
        
          return res.json({ status: "error", message: "User not found" });
      }
  });
});


app.delete('/admin/attendance-update-cancel/:id', (req, res) => {
  
  const a_u_id = req.params.id;

  const sqlReject = `DELETE FROM attendance_update WHERE a_u_id = ?`;
  db.query(sqlReject, [a_u_id], (err, result) => {
      if (err) {
          console.error("Error rejecting leave request:", err);
          return res.status(500).json({ status: "error", message: "Failed to remove attendance remove request" });
      }

      if (result.affectedRows > 0) {
          res.json({ status: "success", message: "Attendance update request rejected and deleted successfully" });
      } else {
          res.status(404).json({ status: "error", message: "Attendance update not found" });
      }
  });
});


app.delete('/admin/attendance-update-approve/:id', (req, res) => {
  
  const attendance_id = req.params.id;

  const sqlReject = `DELETE FROM attendance WHERE attendance_id = ?`;
  db.query(sqlReject, [attendance_id], (err, result) => {
      if (err) {
          console.error("Error rejecting leave request:", err);
          return res.status(500).json({ status: "error", message: "Failed to remove attendance" });
      }

      if (result.affectedRows > 0) {
          res.json({ status: "success", message: "Attendance deleted successfully" });
      } else {
          res.status(404).json({ status: "error", message: "Attendance not found" });
      }
  });
});

app.put('/admin/attendance-update-approve/:id', (req, res) => {
  console.log('data',req.body)
  const {attendance_id,emp_id,date,sign_in,sign_out,hours} = req.body;
  
  // Validate input
  if (!attendance_id) {
    return res.status(400).json({ status: "error", message: "attendance_id is required." });
  }

  // SQL query and values
  const sql = ` UPDATE attendance SET date = ?,sign_in = ?,sign_out = ?, hours = ? WHERE attendance_id = ?`;

  const values = [date,sign_in,sign_out,hours,attendance_id];
  console.log(values)

  // Execute the query
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating attendance:", err);
      return res.status(500).json({ status: "error", message: "Failed to update attendance" });
    }

    if (result.affectedRows > 0) {
      res.json({ status: "success", message: "Attendance updated successfully." });
    } else {
      res.status(404).json({ status: "error", message: "Attendance not found." });
    }
  });
});

app.get('/api/user-email/:emp_id', (req, res) => {
  const emp_id = req.params.emp_id;
  console.log('Received emp_id:', emp_id);

  const sql = "SELECT email FROM login WHERE emp_id = ?";
  db.query(sql, [emp_id], (err, data) => {
    if (err) {
      console.error("Error fetching email:", err);
      return res.json({ status: "error", message: "Failed to retrieve email" });
    }

    console.log('Query result:', data);

    if (data.length > 0) {
      console.log('User found:', data);
      return res.json({ status: "success", data: data });
    } else {
      console.log('No user found for emp_id:', emp_id);
      return res.json({ status: "error", message: "User not found" });
    }
  });
});

app.get('/API', (req, res) => {
  res.send('Backend is running and API is accessible!');
});


app.listen(8081, () => {
    console.log("Listening on port 8081...");
});
