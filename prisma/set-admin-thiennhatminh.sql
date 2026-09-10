UPDATE "User"
SET "role" = 'ADMIN'
WHERE LOWER("email") = 'admin@thiennhatminh.com';

-- This image URL is no longer present in public/uploads. Keep the article visible
-- until its intended cover can be uploaded again from the admin editor.
UPDATE "Post"
SET "coverImage" = '/images/main-bg.jpg'
WHERE "coverImage" = '/uploads/1788944873359-360295045-tnm-welcome-popup.png';
