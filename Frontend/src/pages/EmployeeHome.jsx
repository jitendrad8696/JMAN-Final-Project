import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "../config/axiosConfig";
import { COURSES_API_URI, USERS_API_URI } from "../config/index";
import {
  updateCourseProgress,
  updateCourseRating,
  updateCourseStatus,
} from "../data/coursesSlice";

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const EmployeeHomeContainer = styled.div`
  max-width: 1200px;
  margin: auto;
  padding: 20px;
  animation: ${fadeIn} 0.5s ease-in-out;
`;

const SectionContainer = styled.div`
  margin-bottom: 40px;
`;

const CourseCards = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

const CourseCard = styled.div`
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  width: calc(33.333% - 20px); /* Three cards in a row */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  animation: ${fadeIn} 0.5s ease-in-out;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }
`;

const CourseThumbnail = styled.img`
  width: 100%;
  height: auto;
  border-radius: 4px;
  transition: transform 0.3s;

  &:hover {
    transform: scale(1.05);
  }
`;

const Button = styled.button`
  margin-top: 10px;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;

  &:hover {
    transform: scale(1.05);
  }
`;

const EnrollButton = styled(Button)`
  background-color: #28a745;

  &:hover {
    background-color: #218838;
  }
`;

const ResumeButton = styled(Button)`
  background-color: #007bff;

  &:hover {
    background-color: #0069d9;
  }
`;

const CompletedButton = styled(Button)`
  background-color: #6c757d;

  &:hover {
    background-color: #5a6268;
  }
`;

const Heading = styled.h2`
  font-size: 1.5em;
  margin-bottom: 20px;
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const DeadlineContainer = styled.div`
  margin-top: 10px;
`;

const DeadlineProgressBar = styled.div`
  width: 100%;
  background-color: #f3f3f3;
  border-radius: 5px;
  overflow: hidden;
`;

const Progress = styled.div`
  height: 10px;
  background-color: #28a745;
  width: ${({ $percentage }) => $percentage}%; // Note the $ prefix
  transition: width 0.4s ease;
`;

const Rating = styled.div`
  margin: 5px 0;
`;

function EmployeeHome() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const courses = useSelector((state) => state.courses.courses);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user?._id) return;

      try {
        const response = await axios.get(`${USERS_API_URI}/courses`);

        if (response.data.success) {
          const enrollments = response.data.data;

          enrollments.forEach((enrollment) => {
            const course = courses.find((c) => c.id === enrollment.course);
            if (course) {
              dispatch(
                updateCourseProgress({
                  id: course.id,
                  progress: enrollment.progress,
                })
              );
              dispatch(
                updateCourseStatus({
                  id: course.id,
                  status:
                    enrollment.progress === 100 ? "completed" : "enrolled",
                })
              );
            }
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      }
    };

    fetchEnrollments();
  }, [user, dispatch, courses]);

  useEffect(() => {
    const fetchAverageRatings = async () => {
      try {
        const response = await axios.get(`${COURSES_API_URI}/average-ratings`);
        if (response.data.success) {
          const enrollments = response.data.data;

          enrollments.forEach((enrollment) => {
            const course = courses.find((c) => c.id === enrollment.course);
            if (course) {
              dispatch(
                updateCourseRating({
                  id: course.id,
                  rating: enrollment.averageRating,
                })
              );
            }
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      }
    };

    fetchAverageRatings();
  }, [dispatch, courses]);

  const handleEnroll = async (courseId) => {
    const userId = user._id;

    try {
      const response = await axios.post(`${USERS_API_URI}/enroll`, {
        courseId,
      });
      if (response.data.success) {
        const course = courses.find((c) => c.id === response.data.data.course);
        if (course) {
          dispatch(
            updateCourseStatus({
              id: course.id,
              status:
                response.data.data.progress === 100 ? "completed" : "enrolled",
            })
          );
        }
      }
    } catch (error) {
      console.error(
        "Error enrolling in course:",
        error.response?.data?.message || error.message
      );
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <EmployeeHomeContainer>
      <SearchBar
        type="text"
        placeholder="Search for courses..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Section
        title="Available Courses"
        courses={filteredCourses.filter(
          (course) => course.status === "available"
        )}
        onEnroll={handleEnroll}
      />
      <Section
        title="Enrolled Courses"
        courses={filteredCourses.filter(
          (course) => course.status === "enrolled"
        )}
      />
      <Section
        title="Completed Courses"
        courses={filteredCourses.filter(
          (course) => course.status === "completed"
        )}
      />
    </EmployeeHomeContainer>
  );
}

function Section({ title, courses, onEnroll }) {
  const navigate = useNavigate();

  return (
    <SectionContainer>
      <Heading>{title}</Heading>
      <CourseCards>
        {courses.map((course) => (
          <CourseCard key={course.id}>
            <CourseThumbnail
              src="https://img.youtube.com/vi/eKqY-oP1d_Y/0.jpg"
              alt={course.title}
            />
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            {course.status === "available" && (
              <>
                <Rating>Rating: {course.rating} ★</Rating>
                <EnrollButton onClick={() => onEnroll(course.id)}>
                  Enroll
                </EnrollButton>
              </>
            )}
            {course.status === "enrolled" && (
              <>
                <ResumeButton
                  onClick={() => navigate(`/course-details/${course.id}`)}
                >
                  Resume
                </ResumeButton>
                <DeadlineContainer>
                  <DeadlineProgressBar>
                    <Progress $percentage={course.progress} />{" "}
                  </DeadlineProgressBar>
                </DeadlineContainer>
              </>
            )}
            {course.status === "completed" && (
              <CompletedButton disabled>Completed</CompletedButton>
            )}
          </CourseCard>
        ))}
      </CourseCards>
    </SectionContainer>
  );
}

export default EmployeeHome;
