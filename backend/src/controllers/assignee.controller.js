const User = require('../models/user.model');
const Group = require('../models/group.model');
const { Op } = require('sequelize');

exports.getAssignees = async (req, res) => {
  try {
    const { search = '', limit = 10 } = req.query;
    const userId = req.user.id;

    // Fetch users
    const users = await User.findAll({
      where: {
        status: 'approved',
        ...(search ? {
          [Op.or]: [
            { username: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } }
          ]
        } : {})
      },
      attributes: ['id', 'username', 'email'],
      limit: Math.floor(limit / 2),
      order: [['username', 'ASC']]
    });

    // Fetch groups (private owned by user OR public)
    const groups = await Group.findAll({
      where: {
        [Op.or]: [
          { isPublic: true },
          { createdBy: userId }
        ],
        ...(search ? {
          name: { [Op.iLike]: `%${search}%` }
        } : {})
      },
      attributes: ['id', 'name', 'description', 'isPublic', 'memberIds'],
      limit: Math.ceil(limit / 2),
      order: [['name', 'ASC']]
    });

    // Format results
    const userResults = users.map(user => ({
      id: `user:${user.id}`,
      type: 'user',
      label: user.username,
      email: user.email,
      value: user.email
    }));

    const groupResults = groups.map(group => ({
      id: `group:${group.id}`,
      type: 'group',
      label: group.name,
      description: group.description,
      memberCount: group.memberIds?.length || 0,
      memberIds: group.memberIds,
      isPublic: group.isPublic,
      value: `group:${group.id}`
    }));

    res.json({
      success: true,
      data: [...userResults, ...groupResults]
    });
  } catch (error) {
    console.error('Get assignees error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching assignees' 
    });
  }
};
