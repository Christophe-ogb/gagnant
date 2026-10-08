export type AuthAction = "login" | "register" | "forgot-password" | "reset-password";

const messages: Record<AuthAction, Record<string, string>> = {
  login: {
    invalid_credentials: "Adresse e-mail ou mot de passe incorrect. Vérifiez vos identifiants. Si vous n’avez pas encore de compte, créez-en un.",
    email_not_confirmed: "Votre adresse e-mail n’est pas encore confirmée. Consultez votre boîte de réception et cliquez sur le lien de confirmation.",
    over_request_rate_limit: "Trop de tentatives de connexion. Veuillez patienter quelques minutes avant de réessayer.",
    too_many_requests: "Trop de tentatives de connexion. Veuillez patienter quelques minutes avant de réessayer.",
  },
  register: {
    user_already_exists: "Un compte existe déjà avec cette adresse e-mail. Connectez-vous ou réinitialisez votre mot de passe.",
    email_exists: "Un compte existe déjà avec cette adresse e-mail. Connectez-vous ou réinitialisez votre mot de passe.",
    weak_password: "Le mot de passe ne respecte pas les critères requis : 12 caractères minimum, une minuscule, une majuscule, un chiffre et un symbole. Il ne doit pas non plus figurer parmi les mots de passe compromis connus.",
    email_address_invalid: "Cette adresse e-mail n’est pas valide. Vérifiez-la puis réessayez.",
    over_request_rate_limit: "Trop de demandes d’inscription. Veuillez patienter avant de réessayer.",
    too_many_requests: "Trop de demandes d’inscription. Veuillez patienter avant de réessayer.",
  },
  "forgot-password": {
    over_request_rate_limit: "Trop de demandes de réinitialisation. Veuillez patienter quelques minutes avant de réessayer.",
    too_many_requests: "Trop de demandes de réinitialisation. Veuillez patienter quelques minutes avant de réessayer.",
    email_address_invalid: "Cette adresse e-mail n’est pas valide. Vérifiez-la puis réessayez.",
  },
  "reset-password": {
    weak_password: "Le mot de passe ne respecte pas les critères requis : 12 caractères minimum, une minuscule, une majuscule, un chiffre et un symbole. Il ne doit pas non plus figurer parmi les mots de passe compromis connus.",
    over_request_rate_limit: "Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.",
    too_many_requests: "Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.",
  },
};

const fallbackMessages: Record<AuthAction, string> = {
  login: "La connexion a échoué. Vérifiez votre adresse e-mail et votre mot de passe, puis réessayez.",
  register: "La création du compte a échoué. Vérifiez les informations saisies puis réessayez.",
  "forgot-password": "L’envoi du lien a échoué. Vérifiez l’adresse e-mail puis réessayez.",
  "reset-password": "La modification du mot de passe a échoué. Vérifiez les informations puis réessayez.",
};

export function getAuthErrorMessage(error: unknown, action: AuthAction) {
  if (error && typeof error === "object" && "code" in error && typeof error.code === "string") {
    const message = messages[action][error.code];
    if (message) return message;
  }
  return fallbackMessages[action];
}
