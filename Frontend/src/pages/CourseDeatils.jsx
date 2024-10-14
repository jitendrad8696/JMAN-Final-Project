import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { FaClock } from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "../config/axiosConfig";
import { COURSES_API_URI, USERS_API_URI } from "../config/index";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// Styled Components
const CourseDetailsContainer = styled.div`
  max-width: 1200px;
  margin: auto;
  padding: 20px;
  position: relative;
`;

const TimerContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: #f7f9fc;
  padding: 10px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  &:hover {
    background: #e0e0e0;
  }
`;

const TimerText = styled.span`
  margin-left: 5px;
  font-weight: bold;
`;

const CourseHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const CourseThumbnail = styled.img`
  width: 300px;
  height: auto;
  border-radius: 8px;
  margin-right: 20px;
  transition: transform 0.3s;
  &:hover {
    transform: scale(1.05);
  }
`;

const CourseTitle = styled.h1`
  color: #333;
`;

const CourseDescription = styled.p`
  color: #555;
`;

const ChaptersSection = styled.div`
  margin: 40px 0;
`;

const Chapter = styled.div`
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  &:hover {
    background: #f1f1f1;
  }
`;

const Module = styled.div`
  margin-left: 20px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: #f1f1f1;
  }
`;

const CompletionBar = styled.div`
  position: relative;
  width: 100%;
  background: #f1f1f1;
  border-radius: 5px;
  margin: 20px 0;
`;

const CompletionStatus = styled.div`
  height: 30px;
  background: #28a745;
  width: ${(props) => props.completionPercentage}%;
  border-radius: 5px;
`;

const CompletionPercentageText = styled.span`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  font-weight: bold;
  color: #333;
`;

const Divider = styled.hr`
  border: 1px solid #ddd;
  margin: 20px 0;
`;

const QuizSection = styled.div`
  margin: 40px 0;
  padding: 20px;
  background-color: #f7f9fc;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Question = styled.div`
  margin-bottom: 20px;
`;

const Option = styled.label`
  display: block;
  margin-left: 20px;
  cursor: pointer;
  transition: background-color 0.2s;
  padding: 5px;
  border-radius: 5px;
  input {
    margin-right: 10px;
  }
  &:hover {
    background-color: #e0f7fa;
  }
`;

const DiscussionForum = styled.div`
  margin: 40px 0;
`;

const DiscussionPost = styled.div`
  background: #f1f1f1;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
  &:hover {
    background: #e9ecef;
  }
`;

const CommentInputContainer = styled.div`
  margin-top: 10px;
`;

const CommentInput = styled.input`
  padding: 5px;
  width: calc(100% - 110px);
  transition: border-color 0.2s;
  &:hover {
    border-color: #28a745;
  }
`;

const SubmitButton = styled.button`
  margin-top: 10px;
  padding: 10px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
  &:hover {
    background-color: #218838;
    transform: translateY(-2px);
  }
`;

const FeedbackSection = styled.div`
  margin-top: 40px;
`;

const FeedbackInput = styled.textarea`
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  transition: border-color 0.2s;
  &:hover {
    border-color: #28a745;
  }
`;

const ModuleDescription = styled.div`
  margin-top: 10px;
  padding: 10px;
  background: #f7f9fc;
  border-radius: 5px;
  &:hover {
    background: #e0e0e0;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const CongratulationsMessage = styled.div`
  animation: ${fadeIn} 1s ease-in-out;
  background-color: #28a745;
  color: white;
  padding: 20px;
  text-align: center;
  border-radius: 5px;
  margin: 20px 0;
  &:hover {
    background-color: #218838;
  }
`;

// Main Component
const CourseDetails = () => {
  const { id } = useParams();
  const user = useSelector((state) => state.user.user);
  const courses = useSelector((state) => state.courses.courses);

  const [courseData, setCourseData] = useState();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [time, setTime] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState(Array(3).fill(""));
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [selectedModules, setSelectedModules] = useState({});
  const [rating, setRating] = useState(0);
  const [userScore, setUserScore] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    const course = courses.find((c) => c.id == id);
    if (course) {
      setCourseData(course);
    }
  }, [courses, id]);

  useEffect(() => {
    const fetchCourseDiscussions = async () => {
      try {
        const response = await axios.get(
          `${COURSES_API_URI}/${id}/discussions`
        );
        if (response.data.success) {
          setComments(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching discussions:", error);
      }
    };

    fetchCourseDiscussions();
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!paused) {
        setTime((prevTime) => prevTime + 1);
      }
    }, 1000);

    const saveTimeSpent = async () => {
      try {
        await axios.post(`${USERS_API_URI}/engagement`, {
          course: id,
        });
        console.log("Time spent saved successfully.");
      } catch (error) {
        console.error("Error saving time spent:", error);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setPaused(true);
      } else {
        setPaused(false);
      }
    };

    const handleBeforeUnload = async (event) => {
      await saveTimeSpent(); // Ensure the time is saved on unload
      // Optionally provide a message for confirmation on leaving
      event.returnValue = "Are you sure you want to leave?";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(timer);
      handleBeforeUnload(); // Save time when component unmounts
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [paused, time, id]);

  const handleCommentSubmit = async () => {
    if (newComment.trim()) {
      try {
        const response = await axios.post(
          `${COURSES_API_URI}/${id}/discussions`,
          {
            userId: user._id,
            message: newComment,
          }
        );
        if (response.data.success) {
          setComments([...comments, { ...response.data.data, user }]);
          setNewComment("");
        }
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    }
  };

  const formatTime = (seconds) => {
    const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${secs}`;
  };

  const handleFeedbackSubmit = async () => {
    if (feedback.trim() && rating > 0) {
      try {
        console.log(courseData.id);

        const response = await axios.post(`${USERS_API_URI}/feedback`, {
          course: courseData.id,
          feedbackText: feedback,
          rating: rating,
        });

        if (response.data.success) {
          setFeedbackSubmitted(true);
          setFeedback("");
          setRating(0);
        } else {
          console.error("Feedback submission failed:", response.data.message);
        }
      } catch (error) {
        console.error("Error submitting feedback:", error);
      }
    } else {
      alert("Please provide feedback and a rating.");
    }
  };

  const handleAnswerChange = (questionIndex, answer) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answer;
    setSelectedAnswers(newAnswers);
  };

  const handleQuizSubmit = async () => {
    // Check if all questions have been answered
    const allAnswered = selectedAnswers.every((answer) => answer !== "");

    if (!allAnswered) {
      alert("Please answer all questions before submitting the quiz.");
      return;
    }

    const correctAnswersCount = selectedAnswers.filter((answer, index) => {
      return answer === "A"; // Replace with actual logic for correct answers
    }).length;

    try {
      const response = await axios.post(`${USERS_API_URI}/quiz/score`, {
        course: courseData.id,
        quizScore: correctAnswersCount,
      });

      if (response.data.success) {
        alert(
          `Quiz submitted successfully!\nYour Score: ${correctAnswersCount}`
        );
        setUserScore(correctAnswersCount); // Save the user's score
        setQuizSubmitted(true); // Set the quizSubmitted state to true
      } else {
        console.error("Quiz submission failed:", response.data.message);
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };

  const updateEnrollmentProgress = async (courseId, progress) => {
    try {
      const response = await axios.patch(
        `${USERS_API_URI}/enrollments/progress`,
        {
          courseId: courseData.id,
          progress,
        }
      );
      console.log(response.data);

      return response.data;
    } catch (error) {
      console.error("Error updating enrollment progress:", error);
      throw error;
    }
  };

  const handleModuleToggle = async (chapterIndex, moduleIndex) => {
    const updatedModules = { ...selectedModules };
    const moduleKey = `${chapterIndex}-${moduleIndex}`;
    updatedModules[moduleKey] = !updatedModules[moduleKey];

    setSelectedModules(updatedModules);

    const totalModules = courseData.chapters.reduce(
      (sum, chapter) => sum + chapter.modules.length,
      0
    );
    const completedModules =
      Object.values(updatedModules).filter(Boolean).length;
    const progress = (completedModules / totalModules) * 100;
    if (progress === 100) {
      setShowCongrats(true);
    } else {
      setShowCongrats(false);
    }
    setCompletionPercentage(progress);

    try {
      await updateEnrollmentProgress(id, progress);
    } catch (error) {
      console.error("Failed to update progress:", error);
    }
  };

  if (!courseData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  return (
    <CourseDetailsContainer>
      <TimerContainer>
        <FaClock />
        <TimerText>{formatTime(time)}</TimerText>
      </TimerContainer>

      <CourseHeader>
        <CourseThumbnail
          src="https://img.youtube.com/vi/eKqY-oP1d_Y/0.jpg"
          alt={courseData.title}
        />
        <div>
          <CourseTitle>{courseData.title}</CourseTitle>
          <CourseDescription>{courseData.description}</CourseDescription>
        </div>
      </CourseHeader>

      <CompletionBar>
        <CompletionStatus completionPercentage={completionPercentage} />
        <CompletionPercentageText>
          {Math.round(completionPercentage)}%
        </CompletionPercentageText>
      </CompletionBar>

      {showCongrats && (
        <CongratulationsMessage>
          Congratulations! You've completed the course!
        </CongratulationsMessage>
      )}

      <ChaptersSection>
        <h2>Chapters</h2>
        {courseData.chapters.map((chapter, chapterIndex) => (
          <Chapter key={chapterIndex}>
            <h3>{chapter.title}</h3>
            {chapter.modules.map((module, moduleIndex) => (
              <Module
                key={moduleIndex}
                onClick={() => handleModuleToggle(chapterIndex, moduleIndex)}
              >
                <input
                  type="checkbox"
                  checked={
                    selectedModules[`${chapterIndex}-${moduleIndex}`] || false
                  }
                />
                <span>{module}</span>
              </Module>
            ))}
          </Chapter>
        ))}
      </ChaptersSection>

      <Divider />

      {completionPercentage === 100 && !quizSubmitted && (
        <QuizSection>
          <h2>Quiz</h2>
          {["What is React?", "What is JSX?", "What is a Component?"].map(
            (question, index) => (
              <Question key={index}>
                <h3>{question}</h3>
                {["A", "B", "C", "D"].map((option) => (
                  <Option key={option}>
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      checked={selectedAnswers[index] === option}
                      onChange={() => handleAnswerChange(index, option)}
                    />
                    {option}:{" "}
                    {option === "A"
                      ? "A JavaScript library for building user interfaces"
                      : option === "B"
                      ? "A framework for building applications"
                      : option === "C"
                      ? "A database management system"
                      : "A CSS library"}
                  </Option>
                ))}
              </Question>
            )
          )}
          <SubmitButton
            onClick={handleQuizSubmit}
            disabled={!selectedAnswers.every((answer) => answer !== "")}
          >
            Submit Quiz
          </SubmitButton>
          {!selectedAnswers.every((answer) => answer !== "") && (
            <span style={{ color: "red" }}>Please answer all questions.</span>
          )}
        </QuizSection>
      )}

      <DiscussionForum>
        <h2>Discussion Forum</h2>
        {comments.map((comment, index) => (
          <DiscussionPost key={index}>
            <strong>
              {comment.user.firstName} {comment.user.lastName}
            </strong>{" "}
            <span>({new Date(comment.timestamp).toLocaleString()})</span>
            <p>{comment.message}</p>
          </DiscussionPost>
        ))}
        <CommentInputContainer>
          <CommentInput
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
          />
          <SubmitButton onClick={handleCommentSubmit}>Submit</SubmitButton>
        </CommentInputContainer>
      </DiscussionForum>

      {completionPercentage === 100 && !feedbackSubmitted && (
        <FeedbackSection>
          <h2>Feedback</h2>

          <div>
            <h3>Rating:</h3>
            {[1, 2, 3, 4, 5].map((rate) => (
              <label key={rate}>
                <input
                  type="radio"
                  value={rate}
                  checked={rating === rate}
                  onChange={() => setRating(rate)}
                />
                {rate}
              </label>
            ))}
          </div>

          <FeedbackInput
            rows="4"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Please provide your feedback..."
          />
          <SubmitButton onClick={handleFeedbackSubmit}>
            Submit Feedback
          </SubmitButton>
        </FeedbackSection>
      )}
    </CourseDetailsContainer>
  );
};

export default CourseDetails;
