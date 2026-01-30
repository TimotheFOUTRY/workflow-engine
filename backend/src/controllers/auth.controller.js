const jwt = require('jsonwebtoken');
const winston = require('winston');
const User = require('../models/user.model');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

class AuthController {
  /**
   * Generate JWT token
   */
  generateToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        username: user.username
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(user) {
    return jwt.sign(
      { id: user.id, type: 'refresh' },
      JWT_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );
  }

  /**
   * Register a new user
   */
  async register(req, res) {
    try {
      const { username, email, password, firstName, lastName, service } = req.body;

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
          [require('sequelize').Op.or]: [{ email }, { username }]
        }
      });

      if (existingUser) {
        const statusMessages = {
          pending: 'Un compte avec cet email ou nom d\'utilisateur existe déjà et est en attente d\'approbation.',
          approved: 'Un compte avec cet email ou nom d\'utilisateur existe déjà et est actif. Vous pouvez vous connecter.',
          rejected: 'Un compte avec cet email ou nom d\'utilisateur existe déjà mais a été rejeté. Contactez un administrateur.'
        };
        
        return res.status(400).json({
          success: false,
          error: statusMessages[existingUser.status] || 'User with this email or username already exists',
          existingAccountStatus: existingUser.status
        });
      }

      // Create user with pending status
      const user = await User.create({
        username,
        email,
        password,
        firstName,
        lastName,
        service,
        role: 'user',
        status: 'pending'
      });

      logger.info(`New user registered: ${user.email}`);

      res.status(201).json({
        success: true,
        message: 'Registration successful. Your account is pending approval.',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          status: user.status
        }
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Login user
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      // Find user
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Check if account is approved
      if (user.status !== 'approved') {
        return res.status(403).json({
          success: false,
          error: `Account is ${user.status}. Please wait for admin approval.`
        });
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          error: 'Account is disabled. Please contact administrator.'
        });
      }

      // Validate password
      const isValidPassword = await user.validatePassword(password);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Generate tokens
      const token = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      logger.info(`User logged in: ${user.email}`);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          },
          token,
          refreshToken
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Refresh token
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token is required'
        });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, JWT_SECRET);

      if (decoded.type !== 'refresh') {
        return res.status(401).json({
          success: false,
          error: 'Invalid refresh token'
        });
      }

      // Get user
      const user = await User.findByPk(decoded.id);

      if (!user || !user.isActive || user.status !== 'approved') {
        return res.status(401).json({
          success: false,
          error: 'User not found or inactive'
        });
      }

      // Generate new tokens
      const token = this.generateToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      res.json({
        success: true,
        data: {
          token,
          refreshToken: newRefreshToken
        }
      });
    } catch (error) {
      logger.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token'
      });
    }
  }

  /**
   * Get current user
   */
  async me(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
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
      logger.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Logout (client-side token removal, optional server-side blacklist)
   */
  async logout(req, res) {
    try {
      logger.info(`User logged out: ${req.user.email}`);
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new AuthController();
