const winston = require('winston');
const User = require('../models/user.model');
const { Op } = require('sequelize');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

class UserController {
  /**
   * Get all users (admin only)
   */
  async getAllUsers(req, res) {
    try {
      const { status, role, search, page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      
      if (status) {
        where.status = status;
      }
      
      if (role) {
        where.role = role;
      }
      
      if (search) {
        where[Op.or] = [
          { username: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { service: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows } = await User.findAndCountAll({
        where,
        attributes: { exclude: ['password'] },
        limit: parseInt(limit),
        offset,
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          users: rows,
          total: count,
          page: parseInt(page),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      logger.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get pending users (admin only)
   */
  async getPendingUsers(req, res) {
    try {
      const users = await User.findAll({
        where: { status: 'pending' },
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'ASC']]
      });

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      logger.error('Get pending users error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get user by ID
   */
  async getUser(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('Get user error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Create user (admin only)
   */
  async createUser(req, res) {
    try {
      const { username, email, password, firstName, lastName, service, role, status } = req.body;

      // Validation
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Username, email and password are required'
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ email }, { username }]
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User with this email or username already exists'
        });
      }

      // Create user
      const user = await User.create({
        username,
        email,
        password,
        firstName,
        lastName,
        service,
        role: role || 'user',
        status: status || 'approved' // Admin-created users are approved by default
      });

      logger.info(`User created by admin: ${user.email}`);

      res.status(201).json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          service: user.service,
          role: user.role,
          status: user.status
        }
      });
    } catch (error) {
      logger.error('Create user error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Update user
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { username, email, firstName, lastName, service, role, status, isActive, password } = req.body;

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Check if email/username is already taken by another user
      if (email || username) {
        const existingUser = await User.findOne({
          where: {
            id: { [Op.ne]: id },
            [Op.or]: [
              email ? { email } : null,
              username ? { username } : null
            ].filter(Boolean)
          }
        });

        if (existingUser) {
          return res.status(400).json({
            success: false,
            error: 'Email or username already taken'
          });
        }
      }

      // Update user
      const updates = {};
      if (username !== undefined) updates.username = username;
      if (email !== undefined) updates.email = email;
      if (firstName !== undefined) updates.firstName = firstName;
      if (lastName !== undefined) updates.lastName = lastName;
      if (service !== undefined) updates.service = service;
      if (password !== undefined) updates.password = password;
      
      // Only admins can change these
      if (req.user.role === 'admin') {
        if (role !== undefined) updates.role = role;
        if (status !== undefined) updates.status = status;
        if (isActive !== undefined) updates.isActive = isActive;
      }

      await user.update(updates);

      logger.info(`User updated: ${user.email}`);

      res.json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
          isActive: user.isActive
        }
      });
    } catch (error) {
      logger.error('Update user error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Approve user (admin only)
   */
  async approveUser(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      await user.update({ status: 'approved' });

      logger.info(`User approved: ${user.email}`);

      res.json({
        success: true,
        message: 'User approved successfully',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          status: user.status
        }
      });
    } catch (error) {
      logger.error('Approve user error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Reject user (admin only)
   */
  async rejectUser(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      await user.update({ status: 'rejected' });

      logger.info(`User rejected: ${user.email}`);

      res.json({
        success: true,
        message: 'User rejected successfully',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          status: user.status
        }
      });
    } catch (error) {
      logger.error('Reject user error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Delete user
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Prevent deleting yourself
      if (id === req.user.id) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete your own account'
        });
      }

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      await user.destroy();

      logger.info(`User deleted: ${user.email}`);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      logger.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Reset user password (admin only)
   */
  async resetPassword(req, res) {
    try {
      const { id } = req.params;
      const bcrypt = require('bcryptjs');

      // Prevent resetting your own password through this endpoint
      if (id === req.user.id) {
        return res.status(400).json({
          success: false,
          error: 'Cannot reset your own password through this endpoint'
        });
      }

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      await user.update({ password: hashedPassword });

      logger.info(`Password reset for user: ${user.email}`);

      res.json({
        success: true,
        message: 'Password reset successfully',
        data: {
          temporaryPassword: tempPassword
        }
      });
    } catch (error) {
      logger.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get user statistics (admin only)
   */
  async getUserStatistics(req, res) {
    try {
      const [total, pending, approved, rejected, admins, managers, users] = await Promise.all([
        User.count(),
        User.count({ where: { status: 'pending' } }),
        User.count({ where: { status: 'approved' } }),
        User.count({ where: { status: 'rejected' } }),
        User.count({ where: { role: 'admin' } }),
        User.count({ where: { role: 'manager' } }),
        User.count({ where: { role: 'user' } })
      ]);

      res.json({
        success: true,
        data: {
          total,
          byStatus: {
            pending,
            approved,
            rejected
          },
          byRole: {
            admin: admins,
            manager: managers,
            user: users
          }
        }
      });
    } catch (error) {
      logger.error('Get user statistics error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get users by IDs (bulk fetch for assigned users)
   * Available to all authenticated users for viewing colleague info
   */
  async getUsersByIds(req, res) {
    try {
      const { ids } = req.query;

      if (!ids) {
        return res.status(400).json({
          success: false,
          error: 'Missing ids parameter'
        });
      }

      // Parse IDs - can be comma-separated or array
      const userIds = Array.isArray(ids) ? ids : ids.split(',');

      const users = await User.findAll({
        where: {
          id: userIds
        },
        attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'service', 'role', 'status']
      });

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      logger.error('Get users by IDs error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get basic user info (available to all authenticated users)
   */
  async getUserBasicInfo(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'service', 'role']
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('Get user basic info error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new UserController();
