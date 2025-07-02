"use client";

import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import jwt_decode from "jwt-decode";

export default function GoogleLoginButton() {
  const handleLoginSuccess = async (credentialResponse) => {
    const access_token = credentialResponse.credential;

    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/social/custom/google/",
        { access_token },
      );

      const { access_token: jwtToken, user } = response.data;

      localStorage.setItem("jwtToken", jwtToken);
      alert(`Bienvenido ${user.email}`);
    } catch (error) {
      console.error("Error al autenticar con Django:", error);
      alert("Fallo el login con Google");
    }
  };

  return (
    <div className="p-4">
      <GoogleLogin
        onSuccess={handleLoginSuccess}
        onError={() => {
          console.log("Login fallido");
        }}
        useOneTap
      />
    </div>
  );
}