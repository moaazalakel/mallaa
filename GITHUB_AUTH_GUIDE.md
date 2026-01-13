# دليل المصادقة مع GitHub - Authentication Guide

## المشكلة
GitHub لا يقبل كلمات المرور العادية. يجب استخدام **Personal Access Token** أو **SSH**.

## الحل 1: استخدام Personal Access Token (الأسهل)

### الخطوة 1: إنشاء Token

1. اذهب إلى: https://github.com/settings/tokens
2. اضغط **"Generate new token"** → **"Generate new token (classic)"**
3. أدخل:
   - **Note**: `Mallaa Deployment` (أو أي اسم تفضله)
   - **Expiration**: اختر المدة (90 يوم أو سنة)
   - **Scopes**: حدد `repo` (كامل الوصول للمستودعات)
4. اضغط **"Generate token"** في الأسفل
5. **انسخ Token فوراً** (لن يظهر مرة أخرى!)

### الخطوة 2: استخدام Token

عند `git push`:
- **Username**: `moaazalakel` (اسم المستخدم)
- **Password**: الصق الـ Token الذي نسخته

### الخطوة 3: حفظ Token في Git Credential Manager (اختياري)

لتجنب إدخال Token في كل مرة:

```bash
# حفظ Credentials
git config --global credential.helper store

# عند push، أدخل Token مرة واحدة وسيتم حفظه
git push -u origin main
```

## الحل 2: استخدام SSH (أكثر أماناً)

### الخطوة 1: التحقق من وجود SSH Key

```bash
ls -al ~/.ssh
```

إذا رأيت `id_rsa.pub` أو `id_ed25519.pub`، لديك مفتاح SSH.

### الخطوة 2: إنشاء SSH Key (إذا لم يكن موجوداً)

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

اضغط Enter للقيم الافتراضية (لا تحتاج كلمة مرور).

### الخطوة 3: نسخ المفتاح العام

```bash
cat ~/.ssh/id_ed25519.pub
```

انسخ المحتوى بالكامل.

### الخطوة 4: إضافة المفتاح إلى GitHub

1. اذهب إلى: https://github.com/settings/keys
2. اضغط **"New SSH key"**
3. أدخل:
   - **Title**: `Mallaa Deployment` (أو أي اسم)
   - **Key**: الصق المفتاح الذي نسخته
4. اضغط **"Add SSH key"**

### الخطوة 5: تغيير Remote إلى SSH

```bash
# إزالة HTTPS remote
git remote remove origin

# إضافة SSH remote
git remote add origin git@github.com:moaazalakel/mallaa.git

# التحقق
git remote -v

# رفع الكود
git push -u origin main
```

## الحل 3: استخدام GitHub CLI (gh)

```bash
# تثبيت GitHub CLI (إذا لم يكن مثبتاً)
# Ubuntu/Debian:
sudo apt install gh

# أو من الموقع: https://cli.github.com/

# تسجيل الدخول
gh auth login

# اتبع التعليمات على الشاشة
```

## التوصية

**استخدم الحل 1 (Personal Access Token)** لأنه الأسهل والأسرع.
