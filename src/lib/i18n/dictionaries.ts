// All UI strings for both locales. `ar` defines the shape; `en` must match it
// (TypeScript enforces parity via the `Dictionary` type). Plain strings only —
// dynamic values use a `{placeholder}` that callers replace.
import type { Locale } from "./config";

const ar = {
  appName: "مدير المهام",
  metaDescription: "منظّم مهام شخصي مدعوم بالذكاء الاصطناعي",

  common: {
    all: "الكل",
    uncategorized: "غير مصنّف",
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    no: "لا",
    edit: "تعديل",
    add: "إضافة",
    loading: "جارٍ التحميل…",
    close: "إغلاق",
    retry: "حاول مرة أخرى",
    errorCode: "رمز الخطأ:",
    languageToggle: "تبديل اللغة",
    themeToggle: "تبديل المظهر",
    // Label shown on the toggle to switch TO the other language.
    switchTo: "EN",
    // Name of the language you'd switch TO (used in the menu).
    switchToName: "English",
  },

  menu: {
    open: "القائمة",
    darkMode: "الوضع الليلي",
    lightMode: "الوضع النهاري",
  },

  priority: { high: "عالية", medium: "متوسطة", low: "منخفضة" },
  status: { new: "جديدة", in_progress: "قيد التنفيذ", done: "منجزة" },

  topBar: {
    export: "تصدير",
    exportJson: "تصدير JSON",
    exportCsv: "تصدير CSV (Excel)",
    settings: "الإعدادات",
    logout: "تسجيل الخروج",
  },

  board: {
    noTasksYet: "لا توجد مهام بعد",
    noTasksHint:
      "اكتب مهامك في الصندوق بالأعلى واضغط «تنظيم» ليرتّبها الذكاء الاصطناعي.",
    sectionEmpty: "لا توجد مهام",
    manageCompanies: "المجموعات والفئات",
    searchPlaceholder: "ابحث في المهام…",
    clearSearch: "مسح البحث",
  },

  composer: {
    placeholder:
      "اكتب كل مهامك هنا بأي لغة وأي ترتيب… سيصنّفها الذكاء الاصطناعي حسب المجموعة والفئة والأولوية.",
    hintShortcut: "⌘/Ctrl + Enter للتنظيم",
    hintAddCompanies: "أضف المجموعات والفئات من الإعدادات لتحسين التصنيف",
    organize: "تنظيم",
    organizing: "جارٍ التنظيم…",
    added: "تمت إضافة {count} مهمة وتنظيمها.",
    genericError: "حدث خطأ",
    emptyTasks: "اكتب بعض المهام أولاً",
    organizeFailed: "تعذّر تنظيم المهام. تأكد من إعداد مفتاح الذكاء الاصطناعي.",
    noTasksRecognized: "لم يتم التعرّف على أي مهمة في النص.",
  },

  settings: {
    groupsHeading: "المجموعات",
    groupsHelper: "شركاتك أو عملاؤك أو مشاريعك.",
    addGroup: "إضافة مجموعة",
    groupNamePlaceholder: "اسم المجموعة",
    noGroupsYet: "لا توجد مجموعات بعد — أضف واحدة بالأعلى.",
    deleteGroup: "حذف المجموعة",
    categoriesHeading: "الفئات",
    categoriesHelper: "نوع العمل — مثل التسويق أو التصميم أو الإدارة.",
    addCategory: "إضافة فئة",
    categoryNamePlaceholder: "اسم الفئة",
    noCategoriesYet: "لا توجد فئات بعد — أضف واحدة بالأعلى.",
    deleteCategory: "حذف الفئة",
    chooseColor: "اختر لوناً",
    moveUp: "أعلى",
    moveDown: "أسفل",
    nameRequired: "الاسم مطلوب",
  },

  taskPanel: {
    status: "الحالة",
    title: "العنوان",
    description: "الوصف",
    company: "المجموعة",
    priority: "الأولوية",
    category: "الفئة",
    noCategory: "بدون فئة",
    noDescription: "لا يوجد وصف",
    confirmDelete: "تأكيد الحذف",
    aiAssistLabel: "يمكن للذكاء الاصطناعي المساعدة في هذه المهمة",
    showOriginal: "عرض الأصل",
    hideOriginal: "إخفاء الأصل",
    copyEnglish: "نسخ بالإنجليزية",
    copied: "تم النسخ",
  },
  taskSettings: {
    heading: "النسخ الإنجليزية",
    toggleLabel: "إنشاء نسخة إنجليزية لكل مهمة",
    description:
      "تبقى كل مهمة بلغتها الأصلية مع إضافة نسخة إنجليزية مطابقة — مفيدة لمشاركة المهام مع زملاء يتحدثون الإنجليزية أو عند العمل بين لغتين.",
    backfill: "ترجمة المهام الحالية",
    backfilling: "جارٍ الترجمة…",
    backfillDone: "تمت ترجمة {count} مهمة",
  },

  modelSettings: {
    heading: "نموذج الذكاء الاصطناعي",
    description: "النموذج المستخدم لتنظيم المهام والترجمة والمحادثة.",
  },

  chat: {
    assistant: "مساعد الذكاء الاصطناعي",
    emptyHint:
      "اطلب المساعدة في تنفيذ هذه المهمة — صياغة محتوى، كتابة كود، تحليل، أو خطة عمل.",
    placeholder: "اكتب رسالتك…",
    send: "إرسال",
    copy: "نسخ",
    copied: "تم النسخ",
    error: "تعذّر الحصول على رد. تحقق من إعداد الذكاء الاصطناعي.",
  },

  assistant: {
    title: "المساعد",
    open: "افتح المساعد",
    intro:
      "اسأل عن مهامك عبر جميع المجموعات — ما العاجل، ما المتوقّف، وما الذي يجب التركيز عليه.",
    placeholder: "اسأل عن مهامك…",
    examples: [
      "ما المهام العاجلة عبر كل المجموعات؟",
      "ما الذي يجب أن أركّز عليه اليوم؟",
      "لخّص المهام قيد التنفيذ.",
    ],
  },

  login: {
    title: "تسجيل الدخول",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    continue: "متابعة",
    totpTitle: "رمز التحقق",
    totpHint: "أدخل الرمز المكوّن من 6 أرقام من تطبيق المصادقة.",
    enter: "دخول",
    backToPassword: "← الرجوع لكلمة المرور",
    sixDigit: "أدخل الرمز المكوّن من 6 أرقام",
    invalidCredentials: "بيانات الدخول غير صحيحة",
    sessionExpired: "انتهت الجلسة، أعد إدخال كلمة المرور",
    verifyFailed: "تعذّر التحقق، حاول مرة أخرى",
    invalidCode: "رمز المصادقة غير صحيح",
    tooManyAttempts: "محاولات كثيرة جدًا. حاول مرة أخرى بعد {sec} ثانية.",
  },

  setup: {
    title: "إعداد الحساب",
    subtitle: "إعداد لمرة واحدة لتأمين حسابك الشخصي.",
    step1Title: "١. امسح الرمز بتطبيق المصادقة",
    step1Hint: "استخدم Google Authenticator أو Authy أو ما شابه.",
    qrAlt: "رمز QR للمصادقة",
    manualKey: "أو أدخل المفتاح يدوياً:",
    copyKey: "نسخ المفتاح",
    copied: "✓ تم النسخ",
    step2Title: "٢. بيانات الدخول",
    passwordPlaceholder: "كلمة المرور (8 أحرف على الأقل)",
    confirmPlaceholder: "تأكيد كلمة المرور",
    step3Title: "٣. أكّد الرمز من التطبيق",
    finish: "إنهاء الإعداد والدخول",
    passwordMismatch: "كلمتا المرور غير متطابقتين",
    passwordMin: "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
    sixDigit: "أدخل الرمز المكوّن من 6 أرقام",
    invalidEmail: "البريد الإلكتروني غير صالح",
    accountExists: "تم إعداد الحساب مسبقاً",
    invalidTotp: "رمز المصادقة غير صحيح، حاول مرة أخرى",
  },

  errorPage: {
    title: "حدث خطأ ما",
    message: "تعذّر تحميل البيانات. تحقّق من اتصالك وحاول مرة أخرى.",
  },

  exportCols: {
    company: "المجموعة",
    title: "العنوان",
    description: "الوصف",
    priority: "الأولوية",
    category: "الفئة",
    status: "الحالة",
    createdAt: "تاريخ الإنشاء",
  },
};

export type Dictionary = typeof ar;

const en: Dictionary = {
  appName: "Task Manager",
  metaDescription: "AI-powered personal task manager",

  common: {
    all: "All",
    uncategorized: "Uncategorized",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    no: "No",
    edit: "Edit",
    add: "Add",
    loading: "Loading…",
    close: "Close",
    retry: "Try again",
    errorCode: "Error code:",
    languageToggle: "Switch language",
    themeToggle: "Toggle theme",
    switchTo: "ع",
    switchToName: "العربية",
  },

  menu: {
    open: "Menu",
    darkMode: "Dark mode",
    lightMode: "Light mode",
  },

  priority: { high: "High", medium: "Medium", low: "Low" },
  status: { new: "New", in_progress: "In progress", done: "Done" },

  topBar: {
    export: "Export",
    exportJson: "Export JSON",
    exportCsv: "Export CSV (Excel)",
    settings: "Settings",
    logout: "Log out",
  },

  board: {
    noTasksYet: "No tasks yet",
    noTasksHint:
      "Type your tasks in the box above and hit “Organize” to let AI sort them.",
    sectionEmpty: "No tasks",
    manageCompanies: "Groups & Categories",
    searchPlaceholder: "Search tasks…",
    clearSearch: "Clear search",
  },

  composer: {
    placeholder:
      "Write all your tasks here, in any language and any order… AI will sort them by group, category, and priority.",
    hintShortcut: "⌘/Ctrl + Enter to organize",
    hintAddCompanies: "Add groups and categories in settings to improve classification",
    organize: "Organize",
    organizing: "Organizing…",
    added: "Added and organized {count} task(s).",
    genericError: "Something went wrong",
    emptyTasks: "Write some tasks first",
    organizeFailed: "Couldn’t organize tasks. Make sure the AI key is configured.",
    noTasksRecognized: "No tasks were recognized in the text.",
  },

  settings: {
    groupsHeading: "Groups",
    groupsHelper: "Your businesses, clients, or projects.",
    addGroup: "Add group",
    groupNamePlaceholder: "Group name",
    noGroupsYet: "No groups yet — add one above.",
    deleteGroup: "Delete group",
    categoriesHeading: "Categories",
    categoriesHelper: "The kind of work — e.g. marketing, design, admin.",
    addCategory: "Add category",
    categoryNamePlaceholder: "Category name",
    noCategoriesYet: "No categories yet — add one above.",
    deleteCategory: "Delete category",
    chooseColor: "Choose a color",
    moveUp: "Move up",
    moveDown: "Move down",
    nameRequired: "Name is required",
  },

  taskPanel: {
    status: "Status",
    title: "Title",
    description: "Description",
    company: "Group",
    priority: "Priority",
    category: "Category",
    noCategory: "No category",
    noDescription: "No description",
    confirmDelete: "Confirm delete",
    aiAssistLabel: "AI can help with this task",
    showOriginal: "Show original",
    hideOriginal: "Hide original",
    copyEnglish: "Copy in English",
    copied: "Copied",
  },
  taskSettings: {
    heading: "English versions",
    toggleLabel: "Generate an English version of each task",
    description:
      "Each task keeps its original language and gets a faithful English copy — useful for sharing with English-speaking colleagues or working across languages.",
    backfill: "Translate existing tasks",
    backfilling: "Translating…",
    backfillDone: "Translated {count} task(s)",
  },

  modelSettings: {
    heading: "AI model",
    description: "Used for organizing tasks, translation, and chat.",
  },

  chat: {
    assistant: "AI assistant",
    emptyHint:
      "Ask for help executing this task — drafting content, writing code, analysis, or an action plan.",
    placeholder: "Type your message…",
    send: "Send",
    copy: "Copy",
    copied: "Copied",
    error: "Couldn’t get a reply. Check the AI configuration.",
  },

  assistant: {
    title: "Assistant",
    open: "Open assistant",
    intro:
      "Ask about your tasks across all your groups — what's urgent, what's stuck, and what to focus on.",
    placeholder: "Ask about your tasks…",
    examples: [
      "What's urgent across all my groups?",
      "What should I focus on today?",
      "Summarize my in-progress tasks.",
    ],
  },

  login: {
    title: "Sign in",
    email: "Email",
    password: "Password",
    continue: "Continue",
    totpTitle: "Verification code",
    totpHint: "Enter the 6-digit code from your authenticator app.",
    enter: "Sign in",
    backToPassword: "← Back to password",
    sixDigit: "Enter the 6-digit code",
    invalidCredentials: "Incorrect login details",
    sessionExpired: "Session expired, re-enter your password",
    verifyFailed: "Verification failed, try again",
    invalidCode: "Invalid authentication code",
    tooManyAttempts: "Too many attempts. Try again in {sec} seconds.",
  },

  setup: {
    title: "Account setup",
    subtitle: "A one-time setup to secure your personal account.",
    step1Title: "1. Scan the code with your authenticator app",
    step1Hint: "Use Google Authenticator, Authy, or similar.",
    qrAlt: "Authentication QR code",
    manualKey: "Or enter the key manually:",
    copyKey: "Copy key",
    copied: "✓ Copied",
    step2Title: "2. Login details",
    passwordPlaceholder: "Password (at least 8 characters)",
    confirmPlaceholder: "Confirm password",
    step3Title: "3. Confirm the code from the app",
    finish: "Finish setup & sign in",
    passwordMismatch: "Passwords don’t match",
    passwordMin: "Password must be at least 8 characters",
    sixDigit: "Enter the 6-digit code",
    invalidEmail: "Invalid email address",
    accountExists: "Account is already set up",
    invalidTotp: "Invalid authentication code, try again",
  },

  errorPage: {
    title: "Something went wrong",
    message: "Couldn’t load data. Check your connection and try again.",
  },

  exportCols: {
    company: "Group",
    title: "Title",
    description: "Description",
    priority: "Priority",
    category: "Category",
    status: "Status",
    createdAt: "Created at",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { ar, en };
