import mongoose, { Schema, type Model } from "mongoose";

export interface IGeneralSettings {
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

const generalSettingsSchema = new Schema<IGeneralSettings>(
  {
    organizationName: {
      type: String,
      required: true,
      trim: true,
      default: "Seven State Suppliers",
    },

    slogan: {
      type: String,
      default: "",
      trim: true,
    },

    aboutShort: {
      type: String,
      default: "",
      trim: true,
    },

    aboutLong: {
      type: String,
      default: "",
      trim: true,
    },

    contact: {
      phones: {
        type: [String],
        default: [],
      },
      emails: {
        type: [String],
        default: [],
      },
      address: {
        type: String,
        default: "",
        trim: true,
      },
      city: {
        type: String,
        default: "",
        trim: true,
      },
      postalCode: {
        type: String,
        default: "",
        trim: true,
      },
    },

    branding: {
      logo: {
        type: String,
        default: "",
        trim: true,
      },
      favicon: {
        type: String,
        default: "",
        trim: true,
      },
    },

    socialLinks: {
      facebook: { type: String, default: "", trim: true },
      twitter: { type: String, default: "", trim: true },
      instagram: { type: String, default: "", trim: true },
      linkedin: { type: String, default: "", trim: true },
      youtube: { type: String, default: "", trim: true },
      website: { type: String, default: "", trim: true },
      tiktok: { type: String, default: "", trim: true },
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