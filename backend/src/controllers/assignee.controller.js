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
      attributes: ['id', 'name', 'description', 'isPublic', 'members'],
      limit: Math.ceil(limit / 2),
      order: [['name', 'ASC']]
    });

    // Fetch member details for groups
    const groupsWithMembers = await Promise.all(groups.map(async (group) => {
      const memberIds = group.members || [];
      const members = await User.findAll({
        where: { id: memberIds },
        attributes: ['id', 'username', 'email']
      });
      return {
        ...group.toJSON(),
        memberDetails: members.map(m => ({
          id: m.id,
          username: m.username,
          email: m.email
        }))
      };
    }));

    // Format results
    const userResults = users.map(user => ({
      id: `user:${user.id}`,
      type: 'user',
      label: user.username,
      email: user.email,
      value: user.email
    }));

    const groupResults = groupsWithMembers.map(group => ({
      id: `group:${group.id}`,
      type: 'group',
      label: group.name,
      description: group.description,
      memberCount: group.members?.length || 0,
      memberIds: group.members,
      members: group.memberDetails,
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
