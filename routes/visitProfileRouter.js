// visitProfileRouter.js
const { Router } = require('express');
const { displayData } = require('../controllers/visitProfileController');

const visitProfileRouter = Router();

visitProfileRouter.get('/:id', displayData);

module.exports = visitProfileRouter;
