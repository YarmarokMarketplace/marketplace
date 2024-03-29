require("dotenv").config();

const express = require('express');
const validateBody = require('../../../utils/validateBody');
const upload = require('../../../utils/upload');
const isValidId = require('../../../middlewares/isValidId');
const authenticate = require('../../../middlewares/authenticate');

const { addNotice, 
        getNoticesByCategory, 
        getAllNotices, 
        updateNotice, 
        removeNotice, 
        getNoticeById, 
        toggleActive, 
        getAllUserNotices, 
        addNoticeToFavorite, 
        getFavoriteUserNotices, 
        removeNoticeFromFavorite,
        searchNoticesByKeywords,
        getNoticeContacts,
        checkIsActive,
    } = require('../../../controllers/notices');
const { addNoticeSchema, updateNoticeSchema, toggleActiveSchema} = require('../../../db/models/notices');

const router = express.Router();

router.get('/inactive', checkIsActive);
router.get('/', getAllNotices);
//router.get('/inactive', checkIsActive);
router.get('/:category', getNoticesByCategory);
router.post('/', authenticate, upload.array('photos', 6), validateBody(addNoticeSchema), addNotice);
router.patch('/:id', authenticate, isValidId, validateBody(updateNoticeSchema), upload.array('photos', 6), updateNotice);
router.delete('/notice/:id', authenticate, isValidId, removeNotice);
router.get('/notice/:id', isValidId, getNoticeById);
router.patch('/notice/:id/active', authenticate, isValidId, validateBody(toggleActiveSchema), toggleActive);
router.delete('/favorites/:id', authenticate, isValidId, removeNoticeFromFavorite);
router.get('/user/notices', authenticate, getAllUserNotices);
router.get('/user/favorites', authenticate, getFavoriteUserNotices);
router.post('/favorites/:id', authenticate, addNoticeToFavorite);
router.get('/search/search-notice', searchNoticesByKeywords);
router.get('/notice/contacts-views/:id', getNoticeContacts);



module.exports = router;