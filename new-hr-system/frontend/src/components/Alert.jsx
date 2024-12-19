import React from 'react';
import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

export default function SimpleAlert({ severity = 'success', message, icon }) {
  // Default icons based on severity
  const defaultIcons = {
    success: <CheckIcon fontSize="inherit" />,
    error: <ErrorIcon fontSize="inherit" />,
    warning: <WarningIcon fontSize="inherit" />,
    info: <InfoIcon fontSize="inherit" />,
  };

  return (
    <Alert icon={icon || defaultIcons[severity]} severity={severity}>
      {message}
    </Alert>
  );
}



// import SimpleAlert from '../components/Alert';

// const [showAlert, setShowAlert] = useState(false);
// const [alertMessage, setAlertMessage] = useState('');
// const [alertSeverity, setAlertSeverity] = useState('');

// setAlertMessage("Can't Remove the Request!");
//             setAlertSeverity('error');
//             setShowAlert(true);
//             setTimeout(() => {
//               setShowAlert(false);
//             }, 5000);




// <div className="flex-1 mb-5 ">
//       {showAlert && (
//         <SimpleAlert severity={alertSeverity} message={alertMessage} />
//       )}
//       </div>

