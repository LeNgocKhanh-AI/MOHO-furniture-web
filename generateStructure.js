const fs = require('fs');
const path = require('path');

// Thư mục gốc dự án
const root = path.join(__dirname, 'moho-shop');

// Hàm tạo thư mục nếu chưa tồn tại
function createDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log('Tạo folder:', dirPath);
    }
}

// Hàm tạo file rỗng
function createFile(filePath) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '');
        console.log('Tạo file:', filePath);
    }
}

// Cấu trúc thư mục + file
const structure = {
    '': ['package.json', 'package-lock.json', '.env', '.gitignore', 'README.md', 'server.js', 'app.js'],
    'src/config': ['db.js', 'session.js', 'cloudinary.js', 'app.config.js'],
    'src/constants': ['roles.js','orderStatus.js','productStatus.js','messages.js'],
    'src/middlewares': ['auth.middleware.js','role.middleware.js','error.middleware.js','upload.middleware.js','validate.middleware.js','notFound.middleware.js'],
    'src/models': ['user.model.js','product.model.js','productImage.model.js','category.model.js','order.model.js','orderItem.model.js','cart.model.js','cartItem.model.js','review.model.js','coupon.model.js','news.model.js','inventory.model.js'],
    'src/services': ['auth.service.js','user.service.js','product.service.js','cart.service.js','checkout.service.js','order.service.js','review.service.js','coupon.service.js','news.service.js','inventory.service.js'],
    'src/controllers/client': ['home.controller.js','product.controller.js','cart.controller.js','checkout.controller.js','order.controller.js','auth.controller.js','profile.controller.js','review.controller.js','news.controller.js','promotion.controller.js'],
    'src/controllers/admin': ['dashboard.controller.js','user.controller.js','product.controller.js','order.controller.js','coupon.controller.js','news.controller.js','inventory.controller.js'],
    'src/controllers/staff': ['dashboard.controller.js','order.controller.js','inventory.controller.js','statistics.controller.js'],
    'src/routes/client': ['home.routes.js','product.routes.js','cart.routes.js','checkout.routes.js','order.routes.js','auth.routes.js','profile.routes.js','review.routes.js','news.routes.js','promotion.routes.js'],
    'src/routes/admin': ['dashboard.routes.js','user.routes.js','product.routes.js','order.routes.js','coupon.routes.js','news.routes.js','inventory.routes.js'],
    'src/routes/staff': ['dashboard.routes.js','order.routes.js','inventory.routes.js','statistics.routes.js'],
    'src/validators': ['auth.validator.js','product.validator.js','checkout.validator.js','coupon.validator.js','review.validator.js'],
    'src/utils': ['hash.js','jwt.js','generateCode.js','formatCurrency.js','pagination.js','queryBuilder.js','response.js','sendMail.js'],
    'src/views/layouts': ['client.ejs','admin.ejs','staff.ejs'],
    'src/views/partials': ['header.ejs','footer.ejs','navbar.ejs','admin-sidebar.ejs','staff-sidebar.ejs'],
    'src/views/client': ['home.ejs','about.ejs','contact.ejs','promotions.ejs'],
    'src/views/client/products': ['list.ejs','detail.ejs'],
    'src/views/client/cart': ['index.ejs'],
    'src/views/client/checkout': ['index.ejs','success.ejs'],
    'src/views/client/auth': ['login.ejs','register.ejs'],
    'src/views/admin': ['dashboard.ejs'],
    'src/views/admin/products': ['list.ejs','create.ejs','edit.ejs'],
    'src/views/admin/orders': ['list.ejs','detail.ejs'],
    'src/views/admin/users': ['list.ejs'],
    'src/views/admin/inventory': ['list.ejs'],
    'src/views/staff': ['dashboard.ejs'],
    'src/public/css': [],
    'src/public/js': [],
    'src/public/images/banners': [],
    'src/public/images/products': [],
    'src/public/images/icons': [],
    'src/public/uploads': [],
    'database/migrations': [],
    'database/seeders': [],
    'tests/unit': [],
    'tests/integration': []
};

// Tạo thư mục + file
for (const [dir, files] of Object.entries(structure)) {
    const dirPath = path.join(root, dir);
    createDir(dirPath);
    files.forEach(file => createFile(path.join(dirPath, file)));
}

console.log('Hoàn tất tạo toàn bộ cấu trúc dự án!');