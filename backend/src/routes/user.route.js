import express from 'express';
import { createUser, deleteUser, getAllUsers, loginUser, logOut, updateUser } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

//Public routes
router.post('/register', upload.single("profilePicture"), createUser);
router.post('/login', loginUser);
router.post('/logout', logOut);

//Protected routes
router.get('/all-user',verifyJWT, getAllUsers);
router.put('/:id',verifyJWT, updateUser);
router.delete('/:id',verifyJWT, deleteUser);

export default router;