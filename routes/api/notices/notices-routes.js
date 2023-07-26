require("dotenv").config();

const express = require('express');
const validateBody = require('../../../utils/validateBody');
const upload = require('../../../utils/upload');
const isValidId = require('../../../middlewares/isValidId');

router.get('/:category', getNoticesByCategory);
router.post('/', upload.array('photos', 6), validateBody(addNoticeSchema), addNotice);

const { addNotice, getNoticesByCategory, getAllNotices, updateNotice, removeNotice, getNoticeById } = require('../../../controllers/notices');
const { addNoticeSchema, updateNoticeSchema} = require('../../../db/models/notices');

const router = express.Router();

router.get('/', getAllNotices);
router.get('/:category', getNoticesByCategory);
router.post('/', upload.array('photos', 6), validateBody(addNoticeSchema), addNotice);
router.patch('/:id', isValidId, validateBody(updateNoticeSchema), upload.array('photos', 6), updateNotice);
router.delete('/notice/:id', isValidId, removeNotice);
router.get('/notice/:id', isValidId, getNoticeById);

module.exports = router;