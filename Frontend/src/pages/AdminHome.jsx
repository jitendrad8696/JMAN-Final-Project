import React, { useEffect, useState, useMemo } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "../config/axiosConfig";
import { DEPARTMENTS_API_URI, USERS_API_URI } from "../config/index";
import { useSelector } from "react-redux";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// CreateTeamDialog component
const CreateTeamDialog = ({ open, handleClose }) => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [newTeam, setNewTeam] = useState("");

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${DEPARTMENTS_API_URI}`);
        if (response.data.success) {
          setDepartments(response.data.data);
        }
      } catch (error) {
        console.error(
          "Error fetching departments:",
          error.response?.data || error.message
        );
      }
    };

    if (open) {
      fetchDepartments();
    }
  }, [open]);

  const handleCreateTeam = async () => {
    const trimmedTeam = newTeam.trim();
    if (!trimmedTeam || !selectedDepartment) {
      alert("Team name and department selection cannot be empty.");
      return;
    }

    try {
      const response = await axios.post(`${DEPARTMENTS_API_URI}/create-team`, {
        name: trimmedTeam,
        department: selectedDepartment,
      });

      if (response.data.success) {
        alert("Created new team");
        setNewTeam("");
        setSelectedDepartment("");
        handleClose();
      }
    } catch (error) {
      alert(`Error creating team: ${error.response.data.message}`);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Create Team</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="dense">
          <InputLabel>Department</InputLabel>
          <Select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            fullWidth
          >
            {departments.map((department) => (
              <MenuItem key={department._id} value={department._id}>
                {department.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          margin="dense"
          label="Team Name"
          fullWidth
          value={newTeam}
          onChange={(e) => setNewTeam(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleCreateTeam} color="primary">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

function AdminHome() {
  const user = useSelector((state) => state.user.user);
  const courses = useSelector((state) => state.courses.courses);

  const getCourseName = (id) => {
    const course = courses.find((c) => c.id == id);
    return course.title;
  };

  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("");

  const [openDepartmentDialog, setOpenDepartmentDialog] = useState(false);
  const [openTeamDialog, setOpenTeamDialog] = useState(false);
  const [newDepartment, setNewDepartment] = useState("");

  const [employeeCourses, setEmployeeCourses] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  const handleOpenDepartmentDialog = () => setOpenDepartmentDialog(true);
  const handleCloseDepartmentDialog = () => setOpenDepartmentDialog(false);
  const handleOpenTeamDialog = () => setOpenTeamDialog(true);
  const handleCloseTeamDialog = () => setOpenTeamDialog(false);

  const [lineChartData, setLineChartData] = useState({});
  const [barChartData, setBarChartData] = useState({});
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeCourses: 0,
    engagement: 0,
    // Add any other stats you want to track
  });

  const [departments, setDepartments] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState("");

  const [teams, setTeams] = useState([]); // State to hold teams

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardResponse = await axios.get(
          `${USERS_API_URI}/dashboard-data`
        );
        const {
          employeeCourses,
          dayEngagement,
          monthlyCompletion,
          totalEmployees,
          activeCourses,
          avgEngagement,
        } = dashboardResponse.data.data;

        console.log(dayEngagement);

        setEmployeeCourses(employeeCourses);
        console.log(dashboardResponse.data.data.departments);

        setDepartments(dashboardResponse.data.data.departments);

        // Set line chart data for daily engagement
        const dayEngagements = dayEngagement.split(", ").reduce((acc, day) => {
          const [dayName, value] = day.split(": ");
          const index = [
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
          ].indexOf(dayName);
          if (index !== -1) {
            acc[index] = parseInt(value, 10);
          }
          return acc;
        }, new Array(7).fill(0)); // Initialize an array of 7 zeros

        setLineChartData({
          labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
          datasets: [
            {
              label: "Daily Engagement",
              data: dayEngagements,
              borderColor: "rgba(75, 192, 192, 1)",
              fill: false,
            },
          ],
        });

        // Set bar chart data for monthly course completion
        const monthCompletion = monthlyCompletion
          .split(", ")
          .reduce((acc, month) => {
            const [monthName, value] = month.split(": ");
            const index = [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ].indexOf(monthName);
            if (index !== -1) {
              acc[index] = parseInt(value, 10);
            }
            return acc;
          }, new Array(12).fill(0)); // Initialize an array of 12 zeros

        setBarChartData({
          labels: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ],
          datasets: [
            {
              label: "Monthly Course Completion",
              data: monthCompletion,
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
            },
          ],
        });

        // Update stats
        setStats({
          totalEmployees,
          activeCourses,
          avgEngagement,
        });
      } catch (error) {
        console.error("Error fetching employee data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const selectedDepartment = departments.find(
      (dept) => dept._id === departmentFilter
    );
    if (selectedDepartment) {
      setTeams(selectedDepartment.teams); // Set teams based on selected department
    } else {
      setTeams([]); // Clear teams if no department is selected
    }
  }, [departmentFilter, departments]);

  const handleCreateDepartment = async () => {
    const trimmedDepartment = newDepartment.trim();
    if (!trimmedDepartment) {
      alert("Department name cannot be empty.");
      return;
    }

    try {
      const response = await axios.post(
        `${DEPARTMENTS_API_URI}/create-department`,
        {
          name: trimmedDepartment,
        }
      );
      if (response.data.success) {
        alert("Created new department");
        setNewDepartment("");
        handleCloseDepartmentDialog();
      }
    } catch (error) {
      alert(`Error creating department: ${error.response.data.message}`);
    }
  };

  const filteredEmployees = useMemo(
    () =>
      employeeCourses.filter(
        (employee) =>
          employee.firstName.toLowerCase().includes(search.toLowerCase()) &&
          (departmentFilter === "" ||
            employee.department._id === departmentFilter) &&
          (teamFilter === "" || employee.team._id === teamFilter)
      ),
    [search, departmentFilter, teamFilter, employeeCourses]
  );

  // Show loading screen while data is being fetched
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, padding: "20px" }}>
      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        sx={{ marginBottom: 2 }}
      >
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            sx={{ marginRight: 1 }}
            onClick={handleOpenDepartmentDialog}
          >
            Create Department
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleOpenTeamDialog}
          >
            Create Team
          </Button>
        </Box>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Employees" value={stats.totalEmployees} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Courses" value={stats.activeCourses} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Courses" value="12" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Avg Engagement" value={stats.avgEngagement} />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Search Employee"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Grid>
        <Grid item xs={6} md={4}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Department</InputLabel>
            <Select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((department) => (
                <MenuItem key={department._id} value={department._id}>
                  {department.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} md={4}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Team</InputLabel>
            <Select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              disabled={!departmentFilter} // Disable if no department is selected
            >
              <MenuItem value="">All Teams</MenuItem>
              {teams.map((team) => (
                <MenuItem key={team._id} value={team._id}>
                  {team.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Employee Data
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Team</TableCell>
                  <TableCell>Recent Enrolled Course</TableCell>
                  <TableCell>Feedback</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEmployees.map((employee, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {employee.firstName} {employee.lastName}
                    </TableCell>
                    <TableCell>{employee.department.name}</TableCell>
                    <TableCell>{employee.team.name}</TableCell>
                    <TableCell>{getCourseName(employee.course)}</TableCell>
                    <TableCell>
                      {employee.rating !== "N/A"
                        ? employee.rating
                        : "No rating given"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Employee Daily Engagement
          </Typography>
          <Line data={lineChartData} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Monthly Course Completion
          </Typography>
          <Bar data={barChartData} />
        </Grid>
      </Grid>

      {/* Create Department Dialog */}
      <Dialog open={openDepartmentDialog} onClose={handleCloseDepartmentDialog}>
        <DialogTitle>Create Department</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Department Name"
            fullWidth
            value={newDepartment}
            onChange={(e) => setNewDepartment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDepartmentDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleCreateDepartment} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Team Dialog */}
      <CreateTeamDialog
        open={openTeamDialog}
        handleClose={handleCloseTeamDialog}
      />
    </Box>
  );
}

const StatCard = ({ title, value }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4">{value}</Typography>
    </CardContent>
  </Card>
);

export default AdminHome;
