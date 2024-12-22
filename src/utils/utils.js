const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv")
const slug = require("slug")

dotenv.config();

function hashedPassword(password) {
  const hashPassword = bcrypt.hashSync(password, 10)
  return hashPassword
}


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});



function slugify(text) {
    const timestamp = Date.now();
    const newText = slug(text, {lower: true})

    return `${newText}-${timestamp};`
};


function slugifyUpdate(newText, oldSlug) {
    const sluggedText = slug(newText, {lower: true});
    const oldParts = oldSlug.split("-");
    const lastPart = oldParts[oldParts.length - 1];
    const updateText = sluggedText + "-" + lastPart;;
    return updateText;

}

module.exports  = {
  hashedPassword,
  cloudinary,
  slugify,
  slugifyUpdate
}