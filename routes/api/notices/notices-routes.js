require("dotenv").config();

const express = require('express');
const validateBody = require('../../../utils/validateBody');
const upload = require('../../../utils/upload');
const isValidId = require('../../../middlewares/isValidId');
const authenticate = require('../../../middlewares/authenticate');

const { addNotice, getNoticesByCategory, getAllNotices, updateNotice, removeNotice, getNoticeById, toggleActive, addNoticeToFavorite } = require('../../../controllers/notices');
const { addNoticeSchema, updateNoticeSchema, toggleActiveSchema} = require('../../../db/models/notices');

const router = express.Router();

router.get('/', getAllNotices);
router.get('/:category', getNoticesByCategory);
router.post('/', authenticate, upload.array('photos', 6), validateBody(addNoticeSchema), addNotice);
router.patch('/:id', authenticate, isValidId, validateBody(updateNoticeSchema), upload.array('photos', 6), updateNotice);
router.delete('/notice/:id', authenticate, isValidId, removeNotice);
router.get('/notice/:id', isValidId, getNoticeById);
router.patch('/notice/:id/active', authenticate, isValidId, validateBody(toggleActiveSchema), toggleActive);
router.post('/favorites/:id', authenticate, addNoticeToFavorite);

module.exports = router;