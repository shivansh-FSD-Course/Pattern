import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [10, 'Password must be at least 10 characters'],
    validate: {
      validator: function (value) {
        return /[^A-Za-z0-9]/.test(value);
      },
      message: 'Password must contain at least one special character'
    }
  },
  bio: {
    type: String,
    maxlength: [200, 'Bio cannot exceed 200 characters'],
    default: 'Exploring the mathematical beauty in data...'
  },
  // ✨ NEW FIELDS FOR PERSONALIZATION
  avatar: {
    char: {
      type: String,
      default: 'φ'
    },
    charId: {
      type: Number,
      default: 1
    },
    color: {
      type: String,
      default: '#7BA591'
    }
  },
  theme: {
    id: {
      type: String,
      default: 'green'
    },
    name: {
      type: String,
      default: 'Forest'
    },
    color: {
      type: String,
      default: '#7BA591'
    }
  },
  stats: {
    patternsFound: {
      type: Number,
      default: 0
    },
    daysActive: {
      type: Number,
      default: 0
    },
    totalUploads: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Don't return password in JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;