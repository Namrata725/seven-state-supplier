
import mongoose, { Schema, type Model } from "mongoose";

export interface IGeneralSettings {
  key: string;
  organizationName: string;
  slogan: string;
  aboutShort: string;
  aboutLong: string;

  contact: {
    phones: string[];
    emails: string[];
    address: string;
    city: string;
    postalCode: string;
  };

  branding: {
    logo: string;
    favicon: string;
  };

  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    youtube: string;
    website: string;
    tiktok: string;
  };
}

const isValidUrl = (value: string) => {
  if (!value) return true;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const phoneRegex = /^\+?[0-9\s().-]+$/;

const urlField: {
  type: typeof String;
  default: string;
  trim: boolean;
  validate: {
    validator: (value: string) => boolean;
    message: string;
  };
} = {
  type: String,
  default: "",
  trim: true,
  validate: {
    validator: isValidUrl,
    message: "Please enter a valid HTTP or HTTPS URL",
  },
};

const generalSettingsSchema = new Schema<IGeneralSettings>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "general",
      immutable: true,
    },

    organizationName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
      default: "Seven State Suppliers",
    },

    slogan: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    aboutShort: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    aboutLong: {
      type: String,
      trim: true,
      maxlength: 10000,
      default: "",
    },

    contact: {
      phones: {
        type: [
          {
            type: String,
            trim: true,
            maxlength: 25,
            match: phoneRegex,
          },
        ],
        default: [],
        validate: {
          validator: (value: string[]) => value.length <= 3,
          message: "Maximum number of phone numbers is 3",
        },
      },

      emails: {
        type: [
          {
            type: String,
            trim: true,
            lowercase: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          },
        ],
        default: [],
        validate: {
          validator: (value: string[]) => value.length <= 2,
          message: "Maximum number of email addresses is 2",
        },
      },

      address: {
        type: String,
        trim: true,
        maxlength: 300,
        default: "",
      },

      city: {
        type: String,
        trim: true,
        maxlength: 100,
        default: "",
      },

      postalCode: {
        type: String,
        trim: true,
        maxlength: 20,
        default: "",
      },
    },

    branding: {
      logo: urlField,
      favicon: urlField,
    },

    socialLinks: {
      facebook: urlField,
      twitter: urlField,
      instagram: urlField,
      linkedin: urlField,
      youtube: urlField,
      website: urlField,
      tiktok: urlField,
    },
  },
  {
    timestamps: true,
  }
);

const GeneralSettings: Model<IGeneralSettings> =
  mongoose.models.GeneralSettings ||
  mongoose.model<IGeneralSettings>(
    "GeneralSettings",
    generalSettingsSchema
  );

export default GeneralSettings;
