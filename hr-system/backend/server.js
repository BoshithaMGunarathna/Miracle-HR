const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const multer = require('multer');
// const bcrypt = require('bcryptjs');
const path = require('path'); 
const jwt = require('jsonwebtoken');
const SECRET_KEY = "your_secret_key"; // Replace with a secure, environment-based key


const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection setup
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "hr_miracle"
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
                const token = jwt.sign({ emp_id: user.emp_id }, SECRET_KEY, { expiresIn: '1h' });
                return res.json({
                    status: "success", 
                    message: "Login successful", 
                    token,
                    data: { user, emp_id: user.emp_id }
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


  // app.put('/admin/manage-employee/${empId}', (req, res) => {
  //   const sql = "UPDATE login SET f_name = ?, email = ? WHERE id = ?";
  //   db.query(sql,  (err, data) => {
        
  //       if (err) {
  //           console.error("Error fetching profile data:", err);
  //           return res.json({ status: "error", message: "Failed to retrieve profile data" });
  //       }

  //       if (data.length > 0) {
            
  //           return res.json({ status: "success", data: data });
            
  //       } else {
  //           return res.json({ status: "error", message: "User not found" });
  //       }
  //   });
  // });

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
          return res.json({ status: "success", data: data });
      } else {
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
  const { position, c_number, e_number, email, annual_leave_count, cassual_leave_count, annual_leave_taken, cassual_leave_taken, nopay_leave_taken } = req.body;
  console.log(position, c_number, e_number, email, annual_leave_count, cassual_leave_count, annual_leave_taken, cassual_leave_taken, nopay_leave_taken);

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
    INSERT INTO leave_count (emp_id, annual_leave_count, cassual_leave_count, annual_leave_taken, cassual_leave_taken, nopay_leave_taken) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  // Update leave_count table
  const updateLeaveCountSql = `
    UPDATE leave_count SET annual_leave_count = ?, cassual_leave_count = ?, annual_leave_taken = ?, cassual_leave_taken = ?, nopay_leave_taken = ? WHERE emp_id = ?
  `;

  db.beginTransaction((err) => {
    if (err) {
      console.error("Error starting transaction:", err);
      return res.json({ status: "error", message: "Failed to start transaction" });
    }

    db.query(updateLoginSql, [position, c_number, e_number, email, empId], (err, data) => {
      if (err) {
        return db.rollback(() => {
          console.error("Error updating login table:", err);
          return res.json({ status: "error", message: "Failed to update login data" });
        });
      }

      // First, check if the employee exists in leave_count table
      db.query(checkLeaveCountSql, [empId], (err, results) => {
        if (err) {
          return db.rollback(() => {
            console.error("Error checking leave_count table:", err);
            return res.json({ status: "error", message: "Failed to check leave count data" });
          });
        }

        if (results.length > 0) {
          // Employee exists, so update leave_count table
          db.query(updateLeaveCountSql, [annual_leave_count, cassual_leave_count, annual_leave_taken, cassual_leave_taken, nopay_leave_taken, empId], (err, data) => {
            if (err) {
              return db.rollback(() => {
                console.error("Error updating leave_count table:", err);
                return res.json({ status: "error", message: "Failed to update leave count data" });
              });
            }
          });
        } else {
          // Employee does not exist, so insert new record into leave_count table
          db.query(insertLeaveCountSql, [empId, annual_leave_count, cassual_leave_count, annual_leave_taken, cassual_leave_taken, nopay_leave_taken], (err, data) => {
            if (err) {
              return db.rollback(() => {
                console.error("Error inserting leave_count data:", err);
                return res.json({ status: "error", message: "Failed to insert leave count data" });
              });
            }
          });
        }

        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              console.error("Error committing transaction:", err);
              return res.json({ status: "error", message: "Failed to commit transaction" });
            });
          }

          return res.json({ status: "success", message: "Employee data updated successfully" });
        });
      });
    });
  });
});

 // Submit leave request
app.post('/leave', (req, res) => {
    const { emp_id ,leaveType, reason, startDate, endDate, representative } = req.body;
   

    // Define the SQL query for inserting a new leave request
    const sql = "INSERT INTO leave_requests (emp_id ,leave_type, reason, first_day, last_day, representative) VALUES (?, ?, ?, ?, ?,?)";
    
    // Create an array with the values to insert
    const values = [emp_id ,leaveType, reason, startDate, endDate, representative];

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
    let { leave_request_id, emp_id, leave_type, reason = '', first_day, last_day, representative, days } = req.body;
  
    console.log('Leave request body:', req.body);
  
    // Step 1: Insert into employee_leave table
    const sqlApprove = `
      INSERT INTO employee_leave (emp_id, leave_type, reason, first_day, last_day, representative, days)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
    const values = [emp_id, leave_type, reason, first_day, last_day, representative, days];
  
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
          function updateLeaveCount() {
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
  const { emp_id ,leave_id, old_first_day, startDate, old_last_day, endDate, old_representative, representative, old_reason, reason, old_leave_type, leaveType } = req.body;
 

  // Define the SQL query for inserting a new leave request
  const sql = "INSERT INTO leave_update ( emp_id ,leave_id, old_first_day, first_day, old_last_day, last_day, old_representative, representative, old_reason, reason, old_leave_type, leave_type) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)";
  
  // Create an array with the values to insert
  const values = [ emp_id ,leave_id, old_first_day, startDate, old_last_day, endDate, old_representative, representative, old_reason, reason, old_leave_type, leaveType];

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


app.delete('/update-leave/:id', (req, res) => {
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

app.listen(8081, () => {
    console.log("Listening on port 8081...");
});
