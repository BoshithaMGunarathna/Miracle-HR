-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Dec 10, 2024 at 10:59 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hr_miracle`
--

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `attendance_id` int(100) NOT NULL,
  `emp_id` int(11) NOT NULL,
  `date` date DEFAULT NULL,
  `sign_in` time DEFAULT NULL,
  `sign_out` time DEFAULT NULL,
  `hours` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`attendance_id`, `emp_id`, `date`, `sign_in`, `sign_out`, `hours`) VALUES
(3, 8, '2024-11-28', '15:58:00', '17:34:36', '2.00'),
(4, 7, '2024-11-28', '15:58:13', '17:34:11', '2.00'),
(5, 5, '2024-11-28', '15:58:18', '15:58:28', '0.00'),
(6, 6, '2024-11-28', '15:58:18', '17:34:18', '2.00'),
(7, 4, '2024-11-28', '15:58:33', '15:58:36', '0.00'),
(8, 3, '2024-11-30', '19:58:39', '20:58:50', '1h 0m'),
(9, 2, '2024-11-28', '15:58:44', '15:58:49', '0.00'),
(10, 1, '2024-11-30', '11:20:12', '14:16:44', '2h 56m'),
(12, 7, '2024-11-29', '08:20:40', '14:55:11', '6h 34m'),
(13, 4, '2024-11-29', '08:20:40', '11:15:48', '2h 55m'),
(14, 2, '2024-11-29', '08:20:47', '14:45:08', '6h 24m'),
(15, 5, '2024-11-29', '08:20:53', '11:16:04', '2h 55m'),
(16, 6, '2024-11-29', '08:21:01', '14:46:32', '6h 25m'),
(17, 8, '2024-11-29', '08:21:15', '14:30:32', '6h 9m'),
(18, 3, '2024-11-29', '14:27:13', '14:30:42', '0h 3m'),
(19, 1, '2024-11-29', '14:27:52', '14:55:20', '0h 27m'),
(20, 1, '2024-12-01', '17:05:27', '21:37:26', '4h 31m'),
(21, 1, '2024-12-02', '22:04:21', '23:22:24', '1h 18m'),
(23, 1, '2024-12-06', '09:29:59', '09:53:49', '0h 23m'),
(25, 1, '2024-12-10', '13:01:18', '13:14:52', '0h 13m');

-- --------------------------------------------------------

--
-- Table structure for table `attendance_update`
--

CREATE TABLE `attendance_update` (
  `a_u_id` int(11) NOT NULL,
  `attendance_id` int(11) NOT NULL,
  `emp_id` int(11) DEFAULT NULL,
  `old_date` date DEFAULT NULL,
  `old_sign_in` time DEFAULT NULL,
  `old_sign_out` time DEFAULT NULL,
  `date` date DEFAULT NULL,
  `sign_in` time DEFAULT NULL,
  `sign_out` time DEFAULT NULL,
  `action` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance_update`
--

INSERT INTO `attendance_update` (`a_u_id`, `attendance_id`, `emp_id`, `old_date`, `old_sign_in`, `old_sign_out`, `date`, `sign_in`, `sign_out`, `action`) VALUES
(26, 10, 1, '2024-11-30', '11:20:12', '14:16:44', '2024-11-30', '11:20:13', '14:16:44', 'update'),
(27, 19, 1, '2024-11-29', '14:27:52', '14:55:20', NULL, NULL, NULL, 'delete'),
(28, 10, 1, '2024-11-30', '11:20:12', '14:16:44', '2024-12-01', '11:20:12', '14:16:44', 'update');

-- --------------------------------------------------------

--
-- Table structure for table `employee_leave`
--

CREATE TABLE `employee_leave` (
  `leave_id` int(100) NOT NULL,
  `emp_id` int(11) NOT NULL,
  `leave_type` varchar(20) NOT NULL,
  `first_day` date NOT NULL,
  `last_day` date NOT NULL,
  `days` int(11) NOT NULL,
  `representative` varchar(50) NOT NULL,
  `reason` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_leave`
--

INSERT INTO `employee_leave` (`leave_id`, `emp_id`, `leave_type`, `first_day`, `last_day`, `days`, `representative`, `reason`) VALUES
(197, 1, 'Normal Leave', '2024-11-29', '2024-11-30', 2, 'a a', 'Annual Leave'),
(198, 1, 'Normal Leave', '2024-11-29', '2024-12-03', 5, 'a a', 'No Pay Leave'),
(199, 1, 'Normal Leave', '2024-11-28', '2024-12-03', 6, 'a a', 'Annual Leave'),
(200, 1, 'Normal Leave', '2024-11-24', '2024-11-24', 1, 'a a', 'Annual Leave'),
(201, 1, 'Short Leave', '2024-11-24', '2024-11-24', 1, 'a a', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `leave_count`
--

CREATE TABLE `leave_count` (
  `leave_count_id` int(11) NOT NULL,
  `emp_id` int(11) NOT NULL,
  `cassual_leave_count` int(11) DEFAULT NULL,
  `annual_leave_count` int(11) DEFAULT NULL,
  `cassual_leave_taken` int(11) DEFAULT NULL,
  `annual_leave_taken` int(11) DEFAULT NULL,
  `nopay_leave_taken` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leave_count`
--

INSERT INTO `leave_count` (`leave_count_id`, `emp_id`, `cassual_leave_count`, `annual_leave_count`, `cassual_leave_taken`, `annual_leave_taken`, `nopay_leave_taken`) VALUES
(8, 1, 15, 15, 10, 15, 12),
(10, 2, 10, 10, 4, 4, 4),
(11, 3, 11, 11, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `leave_requests`
--

CREATE TABLE `leave_requests` (
  `leave_request_id` int(100) NOT NULL,
  `emp_id` int(11) NOT NULL,
  `first_day` date NOT NULL,
  `last_day` date NOT NULL,
  `representative` varchar(30) NOT NULL,
  `reason` varchar(20) DEFAULT NULL,
  `leave_type` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave_update`
--

CREATE TABLE `leave_update` (
  `l_u_id` int(100) NOT NULL,
  `emp_id` int(11) NOT NULL,
  `leave_id` int(100) NOT NULL,
  `old_first_day` date NOT NULL,
  `first_day` date DEFAULT NULL,
  `old_last_day` date NOT NULL,
  `last_day` date DEFAULT NULL,
  `old_representative` varchar(50) NOT NULL,
  `representative` varchar(50) DEFAULT NULL,
  `old_reason` varchar(50) DEFAULT NULL,
  `reason` varchar(50) DEFAULT NULL,
  `old_leave_type` varchar(50) NOT NULL,
  `leave_type` varchar(50) DEFAULT NULL,
  `action` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leave_update`
--

INSERT INTO `leave_update` (`l_u_id`, `emp_id`, `leave_id`, `old_first_day`, `first_day`, `old_last_day`, `last_day`, `old_representative`, `representative`, `old_reason`, `reason`, `old_leave_type`, `leave_type`, `action`) VALUES
(76, 1, 197, '2024-11-29', '2024-11-29', '2024-11-30', '2024-11-30', 'a a', 'a a', 'Annual Leave', 'casual', 'Normal Leave', 'normal', 'update'),
(77, 1, 197, '2024-11-29', NULL, '2024-11-30', NULL, 'a a', NULL, 'Annual Leave', NULL, 'Normal Leave', NULL, 'delete'),
(78, 1, 197, '2024-11-29', '2024-11-29', '2024-11-30', '2024-12-01', 'a a', 'a a', 'Annual Leave', 'casual', 'Normal Leave', 'normal', 'update');

-- --------------------------------------------------------

--
-- Table structure for table `login`
--

CREATE TABLE `login` (
  `emp_id` int(10) NOT NULL,
  `f_name` varchar(50) NOT NULL,
  `l_name` varchar(50) NOT NULL,
  `email` varchar(30) NOT NULL,
  `password` varchar(30) NOT NULL,
  `c_number` int(9) NOT NULL,
  `e_number` int(9) NOT NULL,
  `position` varchar(50) NOT NULL,
  `photo` varchar(100) NOT NULL,
  `description` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `login`
--

INSERT INTO `login` (`emp_id`, `f_name`, `l_name`, `email`, `password`, `c_number`, `e_number`, `position`, `photo`, `description`) VALUES
(1, 'Oshadi', 'Irugalbandara', 'iboshadi@gmail.com', '123', 715198342, 715198342, 'Intern', '1731236877982_20200985.jpeg', 'Design creative UI&UX and implement web and mobile applications.'),
(2, 'a', 'a', 'a@gmail.com', 'qwe', 715198343, 715198343, 'Intern', '1732641318295_large-palm-trees-pool.jpg', 'fyfu'),
(3, 'b', 'b', 'b@gmail.com', 'asd', 123445, 1234, 'vdf', '1732726072901_Online Gantt 20241124.png', 'gdsgvs');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`attendance_id`);

--
-- Indexes for table `attendance_update`
--
ALTER TABLE `attendance_update`
  ADD PRIMARY KEY (`a_u_id`);

--
-- Indexes for table `employee_leave`
--
ALTER TABLE `employee_leave`
  ADD PRIMARY KEY (`leave_id`);

--
-- Indexes for table `leave_count`
--
ALTER TABLE `leave_count`
  ADD PRIMARY KEY (`leave_count_id`);

--
-- Indexes for table `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD PRIMARY KEY (`leave_request_id`);

--
-- Indexes for table `leave_update`
--
ALTER TABLE `leave_update`
  ADD PRIMARY KEY (`l_u_id`);

--
-- Indexes for table `login`
--
ALTER TABLE `login`
  ADD PRIMARY KEY (`emp_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `attendance_id` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `attendance_update`
--
ALTER TABLE `attendance_update`
  MODIFY `a_u_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `employee_leave`
--
ALTER TABLE `employee_leave`
  MODIFY `leave_id` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=202;

--
-- AUTO_INCREMENT for table `leave_count`
--
ALTER TABLE `leave_count`
  MODIFY `leave_count_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `leave_requests`
--
ALTER TABLE `leave_requests`
  MODIFY `leave_request_id` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=276;

--
-- AUTO_INCREMENT for table `leave_update`
--
ALTER TABLE `leave_update`
  MODIFY `l_u_id` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

--
-- AUTO_INCREMENT for table `login`
--
ALTER TABLE `login`
  MODIFY `emp_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
