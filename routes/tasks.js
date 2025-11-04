const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');

const router = express.Router();

const safeParseJSON = (raw, fallback = {}) => { if (raw == null) return fallback; try { return JSON.parse(raw); } catch { return fallback; } };
const asInt = (v, d) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
const sendOk = (res, data) => res.status(200).json({ message: 'OK', data });
const sendCreated = (res, data) => res.status(201).json({ message: 'Created', data });
const sendBad = (res, msg) => res.status(400).json({ message: msg, data: null });
const sendNotFound = (res, msg = 'Not found') => res.status(404).json({ message: msg, data: null });
const sendServerErr = (res, msg = 'Server error') => res.status(500).json({ message: msg, data: null });

// GET list
router.get('/', async (req, res) => {
  try {
    const where = safeParseJSON(req.query.where, {});
    const sort = safeParseJSON(req.query.sort, null);
    const select = safeParseJSON(req.query.select, null);
    const skip = asInt(req.query.skip, 0);
    const limit = asInt(req.query.limit, 100);
    const count = req.query.count === 'true';
    if (count) return sendOk(res, await Task.countDocuments(where));
    let q = Task.find(where);
    if (sort) q = q.sort(sort);
    if (select) q = q.select(select);
    if (skip) q = q.skip(skip);
    if (limit) q = q.limit(limit);
    return sendOk(res, await q.exec());
  } catch { return sendServerErr(res); }
});

// GET by ID
router.get('/:id', async (req, res) => {
  try {
    const select = safeParseJSON(req.query.select, null);
    const doc = await Task.findById(req.params.id).select(select || undefined);
    if (!doc) return sendNotFound(res);
    return sendOk(res, doc);
  } catch { return sendServerErr(res); }
});

// CREATE
router.post('/', async (req, res) => {
  try {
    const { name, description, deadline, completed, assignedUser, assignedUserName } = req.body;
    if (!name || !deadline) return sendBad(res, 'Name and deadline are required');
    const task = new Task({
      name: String(name).trim(),
      description: description || '',
      deadline: new Date(deadline),
      completed: !!completed,
      assignedUser: assignedUser || '',
      assignedUserName: assignedUser ? (assignedUserName || 'unassigned') : 'unassigned'
    });
    if (task.assignedUser) {
      const u = await User.findById(task.assignedUser);
      if (u) task.assignedUserName = u.name;
      else {
        task.assignedUser = '';
        task.assignedUserName = 'unassigned';
      }
    }
    await task.save();
    if (task.assignedUser) {
      await User.updateOne({ _id: task.assignedUser }, { $addToSet: { pendingTasks: String(task._id) } });
    }
    return sendCreated(res, task);
  } catch { return sendServerErr(res); }
});

// UPDATE (this is the part we fixed!)
router.put('/:id', async (req, res) => {
  try {
    const { name, description, deadline, completed, assignedUser, assignedUserName } = req.body;

    // ✅ Only enforce name + deadline if they are being updated
    if (('name' in req.body || 'deadline' in req.body) && (!name || !deadline)) {
      return sendBad(res, 'Name and deadline are required');
    }

    const task = await Task.findById(req.params.id);
    if (!task) return sendNotFound(res);

    const prevUser = task.assignedUser || '';
    let nextUser = assignedUser || '';
    let nextUserName = assignedUserName || 'unassigned';

    if (nextUser) {
      const u = await User.findById(nextUser);
      if (!u) return sendBad(res, 'assignedUser not found');
      nextUserName = u.name;
    }

    // ✅ Only update fields that were provided
    if ('name' in req.body) task.name = String(name).trim();
    if ('description' in req.body) task.description = description || '';
    if ('deadline' in req.body) task.deadline = new Date(deadline);
    if ('completed' in req.body) task.completed = !!completed;

    task.assignedUser = nextUser;
    task.assignedUserName = nextUser ? nextUserName : 'unassigned';

    await task.save();

    // Update user task list
    if (String(prevUser) !== String(nextUser)) {
      if (prevUser) await User.updateOne({ _id: prevUser }, { $pull: { pendingTasks: String(task._id) } });
      if (nextUser) await User.updateOne({ _id: nextUser }, { $addToSet: { pendingTasks: String(task._id) } });
    }

    return sendOk(res, task);
  } catch { return sendServerErr(res); }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return sendNotFound(res);
    if (task.assignedUser) {
      await User.updateOne({ _id: task.assignedUser }, { $pull: { pendingTasks: String(task._id) } });
    }
    await task.deleteOne();
    return sendOk(res, null);
  } catch { return sendServerErr(res); }
});

module.exports = router;
