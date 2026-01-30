const Group = require('../models/group.model');
const User = require('../models/user.model');

// Get all groups (public + user's private groups)
exports.getAllGroups = async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    let groups;
    if (isAdmin) {
      // Admin can see all groups
      groups = await Group.findAll({
        order: [['createdAt', 'DESC']],
      });
    } else {
      // Regular users see public groups + their own private groups
      groups = await Group.findAll({
        where: {
          [require('sequelize').Op.or]: [
            { isPublic: true },
            { createdBy: userId }
          ]
        },
        order: [['createdAt', 'DESC']],
      });
    }

    res.json({ success: true, data: groups });
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch groups' });
  }
};

// Get a single group
exports.getGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const group = await Group.findByPk(id);

    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    // Check access rights
    if (!isAdmin && !group.isPublic && group.createdBy !== userId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    res.json({ success: true, data: group });
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch group' });
  }
};

// Create a new group
exports.createGroup = async (req, res) => {
  try {
    const { name, description, isPublic, members } = req.body;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Validation
    if (!name) {
      return res.status(400).json({ success: false, error: 'Group name is required' });
    }

    // Only admin can create public groups
    const groupIsPublic = isAdmin ? (isPublic || false) : false;

    const group = await Group.create({
      name,
      description: description || '',
      isPublic: groupIsPublic,
      createdBy: userId,
      members: members || [userId], // Creator is automatically a member
    });

    res.status(201).json({ success: true, data: group });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ success: false, error: 'Failed to create group' });
  }
};

// Update a group
exports.updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isPublic, members } = req.body;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const group = await Group.findByPk(id);

    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    // Only creator or admin can update
    if (group.createdBy !== userId && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Update fields
    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (members) group.members = members;
    
    // Only admin can change public/private status
    if (isAdmin && isPublic !== undefined) {
      group.isPublic = isPublic;
    }

    await group.save();

    res.json({ success: true, data: group });
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ success: false, error: 'Failed to update group' });
  }
};

// Delete a group
exports.deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const group = await Group.findByPk(id);

    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    // Only creator or admin can delete
    if (group.createdBy !== userId && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    await group.destroy();

    res.json({ success: true, message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ success: false, error: 'Failed to delete group' });
  }
};

// Add member to group
exports.addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId: memberUserId } = req.body;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const group = await Group.findByPk(id);

    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    // Only creator or admin can add members
    if (group.createdBy !== userId && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Check if user exists
    const user = await User.findByPk(memberUserId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if already a member
    if (group.members.includes(memberUserId)) {
      return res.status(400).json({ success: false, error: 'User is already a member' });
    }

    // Add member
    group.members = [...group.members, memberUserId];
    await group.save();

    res.json({ success: true, data: group });
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ success: false, error: 'Failed to add member' });
  }
};

// Remove member from group
exports.removeMember = async (req, res) => {
  try {
    const { id, userId: memberUserId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const group = await Group.findByPk(id);

    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    // Only creator or admin can remove members
    if (group.createdBy !== userId && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Cannot remove creator
    if (memberUserId === group.createdBy) {
      return res.status(400).json({ success: false, error: 'Cannot remove group creator' });
    }

    // Remove member
    group.members = group.members.filter(id => id !== memberUserId);
    await group.save();

    res.json({ success: true, data: group });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ success: false, error: 'Failed to remove member' });
  }
};
