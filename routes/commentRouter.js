const { Router } = require('express');
const {add_comment,update_comment,delete_comment} = require('../controllers/commentController');

const commentRouter = Router();
commentRouter.post('/:blogid', add_comment); 
commentRouter.put('/:commentid/edit', update_comment); // For updating comments
commentRouter.delete('/:commentid/delete', delete_comment); // For deleting comments

module.exports = commentRouter;
