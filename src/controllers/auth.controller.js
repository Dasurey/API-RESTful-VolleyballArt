import authService from '../services/auth.service.js';

export const loginUser = async (req, res) => {
  try {
    const user = req.body;
    const token = await authService.loginUser(user);
    res.json({ token });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ error: error.message || 'Error interno del servidor' });
  }
};
