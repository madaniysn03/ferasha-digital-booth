export type Locale = "fr" | "ar";

export type Translations = {
  nav: { explore: string; myFerasha: string; publish: string; account: string; signOut: string; signIn: string; myAccount: string };
  home: {
    tagline: string; title: string; titleHighlight: string; subtitle: string;
    createCta: string; loginCta: string; searchPlaceholder: string;
    allCategories: string; allCities: string; emptyTitle: string; emptySubtitle: string; loadMore: string;
  };
  auth: {
    signupTitle: string; signinTitle: string; signupSubtitle: string; signinSubtitle: string;
    orEmail: string; fullName: string; email: string; password: string;
    createAccount: string; signIn: string; hasAccount: string; noAccount: string;
    switchToSignin: string; switchToSignup: string; backHome: string;
    signupSuccess: string; errInvalid: string; errUnconfirmed: string;
    errUserExists: string; errRateLimit: string; errServer: string;
    errNetwork: string; errSuspended: string; errGeneric: string;
  };
  ferasha: {
    publications: string; noPublications: string; reviews: string; leaveReview: string;
    editReview: string; reviewPlaceholder: string; submitReview: string; updateReview: string;
    deleteReview: string; noReviews: string; loginToReview: string; loginToReviewSuffix: string;
    reportReview: string; reportThanks: string; sellerReply: string; backToAll: string;
    whatsapp: string; call: string; emailContact: string; instagram: string; linkedin: string;
    website: string; share: string; linkCopied: string;
  };
  notFound: { title: string; subtitle: string; home: string };
  devenirPro: {
    title: string; subtitle: string; step1: string; step2: string; step3: string;
    ctaWhatsapp: string; ctaCall: string; prefilledMessage: string;
    alreadyPro: string; alreadyProLink: string; backHome: string;
  };
};

const fr: Translations = {
  nav: {
    explore: "Explorer",
    myFerasha: "Ma Ferasha",
    publish: "Publier",
    account: "Compte",
    signOut: "Déconnexion",
    signIn: "Se connecter",
    myAccount: "Mon compte",
  },
  home: {
    tagline: "Ta Ferasha digitale, en 1 minute",
    title: "La marketplace des entrepreneurs",
    titleHighlight: "de chez toi",
    subtitle: "Découvre artisans, talents, services et produits près de chez toi — ou ouvre ta propre vitrine en 3 clics.",
    createCta: "Créer ma Ferasha",
    loginCta: "Se connecter",
    searchPlaceholder: "Rechercher une Ferasha, un talent…",
    allCategories: "Tout",
    allCities: "Toutes villes",
    emptyTitle: "Aucune Ferasha pour le moment",
    emptySubtitle: "Sois le premier à ouvrir ta vitrine ici.",
    loadMore: "Charger plus",
  },
  auth: {
    signupTitle: "Ouvre ta Ferasha",
    signinTitle: "Bon retour 👋",
    signupSubtitle: "Crée ton compte en 30 secondes.",
    signinSubtitle: "Connecte-toi pour gérer ta vitrine.",
    orEmail: "ou par email",
    fullName: "Nom complet",
    email: "Email",
    password: "Mot de passe (min. 6 caractères)",
    createAccount: "Créer mon compte",
    signIn: "Se connecter",
    hasAccount: "Tu as déjà un compte ?",
    noAccount: "Pas encore inscrit ?",
    switchToSignin: "Se connecter",
    switchToSignup: "Créer un compte",
    backHome: "Retour à l'accueil",
    signupSuccess: "Compte créé ! Tu peux te connecter maintenant.",
    errInvalid: "Email ou mot de passe incorrect. Vérifie tes identifiants, ou utilise « Créer un compte » si tu n'en as pas.",
    errUnconfirmed: "Ton email n'est pas encore confirmé. Ouvre le lien reçu par email avant de te connecter.",
    errUserExists: "Un compte existe déjà avec cet email. Connecte-toi plutôt que de créer un compte.",
    errRateLimit: "Trop de tentatives. Patiente une minute avant de réessayer.",
    errServer: "Le problème vient du serveur, pas de tes identifiants. Réessaie dans un instant ; si ça persiste, contacte l'administrateur.",
    errNetwork: "Connexion au serveur impossible. Vérifie ta connexion internet puis réessaie.",
    errSuspended: "Ton compte a été suspendu par l'administrateur. Contacte-le pour le réactiver.",
    errGeneric: "Une erreur inattendue est survenue. Réessaie, et si le problème persiste contacte l'administrateur.",
  },
  ferasha: {
    publications: "Publications",
    noPublications: "Cette Ferasha n'a pas encore publié.",
    reviews: "Avis",
    leaveReview: "Laisser un avis",
    editReview: "Modifier mon avis",
    reviewPlaceholder: "Ton expérience avec cette Ferasha...",
    submitReview: "Publier mon avis",
    updateReview: "Mettre à jour",
    deleteReview: "Supprimer",
    noReviews: "Aucun avis pour l'instant.",
    loginToReview: "Connecte-toi",
    loginToReviewSuffix: "avec un compte client pour laisser un avis.",
    reportReview: "Signaler cet avis",
    reportThanks: "Merci, cet avis a été signalé pour modération.",
    sellerReply: "Réponse du vendeur",
    backToAll: "Toutes les Ferashas",
    whatsapp: "WhatsApp",
    call: "Appeler",
    emailContact: "Email",
    instagram: "Instagram",
    linkedin: "LinkedIn",
    website: "Site web",
    share: "Partager cette Ferasha",
    linkCopied: "Lien copié !",
  },
  notFound: {
    title: "Page introuvable",
    subtitle: "Cette page n'existe pas ou a été déplacée.",
    home: "Retour à l'accueil",
  },
  devenirPro: {
    title: "Deviens partenaire Ferasha Quantic",
    subtitle: "La création d'une Ferasha est réservée aux comptes professionnels. Voici comment obtenir le tien :",
    step1: "1. Contacte notre équipe sur WhatsApp en un clic ci-dessous.",
    step2: "2. On échange avec toi et on valide ton profil directement sur WhatsApp.",
    step3: "3. Une fois d'accord, on te crée ton compte pro et on t'envoie tes identifiants.",
    ctaWhatsapp: "Contacter sur WhatsApp",
    ctaCall: "Appeler l'équipe",
    prefilledMessage: "Salam, je souhaiterais créer ma Ferasha sur Ferasha Quantic. Pouvez-vous m'aider ?",
    alreadyPro: "Tu as déjà reçu tes identifiants ?",
    alreadyProLink: "Connecte-toi ici",
    backHome: "Retour à l'accueil",
  },
};

const ar: Translations = {
  nav: {
    explore: "استكشف",
    myFerasha: "فيراشتي",
    publish: "انشر",
    account: "حسابي",
    signOut: "تسجيل الخروج",
    signIn: "تسجيل الدخول",
    myAccount: "حسابي",
  },
  home: {
    tagline: "فيراشتك الرقمية في دقيقة واحدة",
    title: "سوق رواد الأعمال",
    titleHighlight: "من بلدك",
    subtitle: "اكتشف الحرفيين والمواهب والخدمات والمنتجات القريبة منك — أو افتح واجهتك الخاصة في 3 نقرات.",
    createCta: "أنشئ فيراشتي",
    loginCta: "تسجيل الدخول",
    searchPlaceholder: "ابحث عن فيراشا أو موهبة…",
    allCategories: "الكل",
    allCities: "كل المدن",
    emptyTitle: "لا توجد فيراشا حاليًا",
    emptySubtitle: "كن أول من يفتح واجهته هنا.",
    loadMore: "تحميل المزيد",
  },
  auth: {
    signupTitle: "افتح فيراشتك",
    signinTitle: "مرحبًا بعودتك 👋",
    signupSubtitle: "أنشئ حسابك في 30 ثانية.",
    signinSubtitle: "سجّل الدخول لإدارة واجهتك.",
    orEmail: "أو عبر البريد الإلكتروني",
    fullName: "الاسم الكامل",
    email: "البريد الإلكتروني",
    password: "كلمة المرور (6 أحرف على الأقل)",
    createAccount: "إنشاء حسابي",
    signIn: "تسجيل الدخول",
    hasAccount: "لديك حساب بالفعل؟",
    noAccount: "لم تسجل بعد؟",
    switchToSignin: "تسجيل الدخول",
    switchToSignup: "إنشاء حساب",
    backHome: "العودة إلى الرئيسية",
    signupSuccess: "تم إنشاء الحساب! يمكنك تسجيل الدخول الآن.",
    errInvalid: "البريد الإلكتروني أو كلمة المرور غير صحيحة. تحقّق من بياناتك، أو استخدم «إنشاء حساب» إن لم يكن لديك حساب.",
    errUnconfirmed: "لم يتم تأكيد بريدك الإلكتروني بعد. افتح الرابط المُرسَل إلى بريدك قبل تسجيل الدخول.",
    errUserExists: "يوجد حساب بهذا البريد الإلكتروني بالفعل. سجّل الدخول بدل إنشاء حساب.",
    errRateLimit: "محاولات كثيرة جدًا. انتظر دقيقة قبل إعادة المحاولة.",
    errServer: "المشكلة من الخادم وليست من بياناتك. أعد المحاولة بعد قليل، وإن استمرّت المشكلة تواصل مع المسؤول.",
    errNetwork: "تعذّر الاتصال بالخادم. تحقّق من اتصالك بالإنترنت ثم أعد المحاولة.",
    errSuspended: "تم تعليق حسابك من قِبل المسؤول. تواصل معه لإعادة تفعيله.",
    errGeneric: "حدث خطأ غير متوقع. أعد المحاولة، وإن استمرّت المشكلة تواصل مع المسؤول.",
  },
  ferasha: {
    publications: "المنشورات",
    noPublications: "لم تنشر هذه الفيراشا شيئًا بعد.",
    reviews: "التقييمات",
    leaveReview: "أضف تقييمًا",
    editReview: "تعديل تقييمي",
    reviewPlaceholder: "تجربتك مع هذه الفيراشا...",
    submitReview: "نشر تقييمي",
    updateReview: "تحديث",
    deleteReview: "حذف",
    noReviews: "لا توجد تقييمات حاليًا.",
    loginToReview: "سجّل الدخول",
    loginToReviewSuffix: "بحساب عميل لإضافة تقييم.",
    reportReview: "الإبلاغ عن هذا التقييم",
    reportThanks: "شكرًا، تم الإبلاغ عن هذا التقييم للمراجعة.",
    sellerReply: "رد البائع",
    backToAll: "كل الفيراشات",
    whatsapp: "واتساب",
    call: "اتصال",
    emailContact: "البريد الإلكتروني",
    instagram: "إنستغرام",
    linkedin: "لينكدإن",
    website: "الموقع الإلكتروني",
    share: "شارك هذه الفيراشا",
    linkCopied: "تم نسخ الرابط!",
  },
  notFound: {
    title: "الصفحة غير موجودة",
    subtitle: "هذه الصفحة غير موجودة أو تم نقلها.",
    home: "العودة إلى الرئيسية",
  },
  devenirPro: {
    title: "كن شريكًا في فيراشا كوانتيك",
    subtitle: "إنشاء فيراشا متاح فقط للحسابات الاحترافية. إليك كيفية الحصول على حسابك:",
    step1: "1. تواصل مع فريقنا عبر واتساب بضغطة واحدة أدناه.",
    step2: "2. نتحدث معك ونتحقق من ملفك مباشرة عبر واتساب.",
    step3: "3. بمجرد الاتفاق، ننشئ لك حسابًا احترافيًا ونرسل لك بيانات الدخول.",
    ctaWhatsapp: "تواصل عبر واتساب",
    ctaCall: "اتصل بالفريق",
    prefilledMessage: "سلام، أود إنشاء فيراشتي على فيراشا كوانتيك. هل يمكنكم مساعدتي؟",
    alreadyPro: "هل تلقيت بيانات الدخول من قبل؟",
    alreadyProLink: "سجّل الدخول هنا",
    backHome: "العودة إلى الرئيسية",
  },
};

export const translations = { fr, ar };
