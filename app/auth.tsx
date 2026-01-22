import {
  Box,
  Button,
  ButtonText,
  FormControl,
  FormControlError,
  FormControlErrorText,
  Heading,
  HStack,
  Input,
  InputField,
  Link,
  LinkText,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import React, { useState } from "react";
import { Alert } from "react-native";

const API_BASE = "http://192.168.1.101:4000/api/auth";

type AuthMode = "login" | "register";

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [formData, setFormData] = useState({
    name: "",
    login: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  const { mutate: submitAuth, isPending } = useMutation({
    mutationFn: async () => {
      const url =
        mode === "login" ? `${API_BASE}/login` : `${API_BASE}/register`;
      const payload =
        mode === "login"
          ? { login: formData.login, password: formData.password }
          : {
              name: formData.name,
              login: formData.login,
              email: formData.email || undefined,
              password: formData.password,
              phoneNumber: formData.phoneNumber || undefined,
            };

      const res = await axios.post(url, payload);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        Alert.alert("Success", data.message, [
          { text: "OK", onPress: () => console.log("Token:", data.token) },
        ]);
      }
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Network or server error";
      Alert.alert("Error", msg);
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (mode === "login") {
      return formData.login.trim() && formData.password;
    }

    if (!formData.name.trim() || !formData.login.trim() || !formData.password) {
      Alert.alert(
        "Validation Error",
        "Name, login, and password are required.",
      );
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert(
        "Validation Error",
        "Password must be at least 6 characters.",
      );
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      submitAuth();
    }
  };

  return (
    <Box flex={1} p="$6" bg="$backgroundLight0" justifyContent="center">
      <VStack space="xl">
        <Heading size="2xl" textAlign="center">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </Heading>

        {mode === "register" && (
          <FormControl>
            <Input>
              <InputField
                placeholder="Full Name"
                value={formData.name}
                onChangeText={(v: any) => handleInputChange("name", v)}
              />
            </Input>
          </FormControl>
        )}

        <FormControl>
          <Input>
            <InputField
              placeholder="Login"
              value={formData.login}
              onChangeText={(v: any) => handleInputChange("login", v)}
            />
          </Input>
        </FormControl>

        {mode === "register" && (
          <>
            <FormControl>
              <Input>
                <InputField
                  placeholder="Email (optional)"
                  value={formData.email}
                  onChangeText={(v: any) => handleInputChange("email", v)}
                  keyboardType="email-address"
                />
              </Input>
            </FormControl>

            <FormControl>
              <Input>
                <InputField
                  placeholder="Phone (optional, e.g. +1234567890)"
                  value={formData.phoneNumber}
                  onChangeText={(v: any) => handleInputChange("phoneNumber", v)}
                  keyboardType="phone-pad"
                />
              </Input>
            </FormControl>
          </>
        )}

        <FormControl>
          <Input>
            <InputField
              placeholder="Password"
              value={formData.password}
              onChangeText={(v: any) => handleInputChange("password", v)}
              secureTextEntry
            />
          </Input>
          {formData.password &&
            formData.password.length < 6 &&
            mode === "register" && (
              <FormControlError>
                <FormControlErrorText>Password too short</FormControlErrorText>
              </FormControlError>
            )}
        </FormControl>

        <Button
          onPress={handleSubmit}
          isLoading={isPending}
          isDisabled={isPending}
          size="lg"
        >
          <ButtonText>{mode === "login" ? "Sign In" : "Sign Up"}</ButtonText>
        </Button>

        <HStack justifyContent="center" space="sm">
          <Text>
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}
          </Text>
          <Link
            onPress={() => setMode(mode === "login" ? "register" : "login")}
          >
            <LinkText>{mode === "login" ? "Sign Up" : "Sign In"}</LinkText>
          </Link>
        </HStack>
      </VStack>
    </Box>
  );
}
