import { getAllMentors, getMentorById } from '../services/mentor.service.js';
import { sendSuccess } from '../utils/response.js';
import { ApiError } from '../utils/apiError.js';

export const listMentors = async (req, res, next) => {
  try {
    const mentors = await getAllMentors();
    return sendSuccess(res, mentors, 200, 'Mentors fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const getMentor = async (req, res, next) => {
  try {
    const mentor = await getMentorById(req.params.id);
    if (!mentor) {
      throw ApiError.notFound(`Mentor with id "${req.params.id}" not found`);
    }
    return sendSuccess(res, mentor, 200, 'Mentor details fetched successfully');
  } catch (error) {
    next(error);
  }
};
