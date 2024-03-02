import { StyleSheet, Text, View, Image, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import CommonLayout from "@/components/layout/CommonLayout";
import { ScrollView } from "react-native-gesture-handler";
import BackHeader from "@/components/global/header/BackHeader";
import { useRouter } from "expo-router";
import CustomInput from "@/components/global/common/CommonInput";
import * as ImagePicker from "expo-image-picker";
import Colors from "@/constants/Colors";
import { Formik } from "formik";
import { useToast } from "react-native-toast-notifications";
import { ProfilevalidationSchema } from "@/components/global/profile/validation/ProfileValidation";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import { AntDesign, Entypo } from "@expo/vector-icons";
import CustomButton from "@/components/global/common/ui/Button";
import { useMutation } from "@tanstack/react-query";
import adminAPI from "@/api/adminAPI";
import { API } from "@/api/endpoints";
import { useAuthUserContext } from "@/context/AuthUserProvider";
import usePatchUpdate from "@/hooks/usePatchUpdate";
import { getImageFileData } from "@/utils/getFileType";
import { formatDate } from "@/utils/formatDate";

const Page = () => {
  const toast = useToast();
  const router = useRouter();
  const [isEditable, setIsEditable] = useState(false);
  const { userData, userRefetch, userLoading } = useAuthUserContext();

  //For Editable icon ...
  const handleEdit = () => {
    setIsEditable(!isEditable);
  };

  // Mutation for Change Password ...
  const { mutateAsync: changePassMutation, isLoading: isChangePassLoading } =
    useMutation((payload) => adminAPI.patch(API.UpdateUser, payload));

  // Mutation for Profile Picture changes ...
  const {
    mutateAsync: changeProfile,
    isLoading: changeProfileLoading,
    isError,
  } = usePatchUpdate({
    isMultiPart: true,
    endpoint: API.UpdateProfile,

    onSuccess: () => {
      toast.show("Profile Update Successfully ! 👋", { type: "success" });
    },

    onError: () => console.error("Error creating data:"),
  });

  if (isError) {
    console.log("Profile Uploade Failed");
  }

  // For Change Personal Info Submit
  const handleSubmit = async (
    values: any,
    { setSubmitting, setErrors }: { setSubmitting: any; setErrors: any }
  ) => {
    try {
      setSubmitting(true);
      const response = await changePassMutation(values);
      if (response) {
        userRefetch();
        toast.show("Profile Update Successfully ! 👋", { type: "success" });
      }
      setSubmitting(false);
    } catch (err) {
      toast.show("Something went wrong 👋", {
        type: "danger",
      });
      setSubmitting(false);
      setErrors(err);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need media library permissions to make this work.");
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      aspect: [5, 6],
    });

    if (!result.canceled) {
      //setImage(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: any) => {
    try {
      const { type, name, size } = await getImageFileData(uri);

      let payload = new FormData();
      payload?.append("profilePicture", {
        uri: uri,
        type: type,
        name: name,
        size: size,
      });

      // Assuming changeProfile function takes the blob as parameter
      const submitresponse = await changeProfile(payload);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <CommonLayout>
      <BackHeader Headertext="Back to" />
      <ScrollView>
        <View className="p-3 mt-1 ml-2 mb-2 flex flex-row justify-between items-center">
          <Text className=" text-[18px] font-medium">Personal Information</Text>
          <TouchableOpacity onPress={() => handleEdit()}>
            {isEditable ? (
              <View className="bg-slate-200 rounded-3xl h-[35px] w-[35px] justify-center items-center ">
                <AntDesign name="closecircleo" size={24} color={Colors.black} />
              </View>
            ) : (
              <View className="bg-slate-200 rounded-3xl h-[35px] w-[35px] justify-center items-center">
                <Entypo name="edit" size={24} color={Colors.black} />
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View className="items-center">
          <View className="w-[92%] h-44 items-center justify-center bg-white rounded-3xl shadow">
            {(changeProfileLoading || userLoading) && (
              <View className="z-50 blur-xl w-[100%] flex flex-col justify-center items-center shadow-lg border-rounded rounded-3xl h-44 bg-gray-100 ">
                <ActivityIndicator size={30} color={"blue"} />
              </View>
            )}

            {userData?.profilePicture ? (
              <Image
                className="w-full h-full  absolute rounded-3xl "
                source={{ uri: userData?.profilePicture }}
                resizeMode="cover"
              />
            ) : (
              <Image
                className="w-full h-full  absolute rounded-3xl"
                source={require("../../../../assets/images/profile.png")}
              />
            )}
            <TouchableOpacity onPress={() => pickImage()}>
              <Image
                className="w-[35px] h-[35px]"
                source={require("../../../../assets/images/profile_edit.png")}
              />
            </TouchableOpacity>
          </View>
        </View>

        <Formik
          initialValues={{
            email: userData?.email || "",
            fullName: userData?.fullName || "",
            address: userData?.address || "",
            phoneNumber: userData?.phoneNumber || "",
            dateOfBirth: userData?.dateOfBirth || "",
          }}
          onSubmit={handleSubmit}
          validationSchema={ProfilevalidationSchema}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <View className="flex-col h-auto m-3 shadow-lg shadow-gray-400 bg-white rounded-xl ">
              <View className="p-3">
                <CustomInput
                  icon="person-circle-sharp"
                  placeholder="Enter your Full Name"
                  autoCapitalize="none"
                  keyboardAppearance="dark"
                  returnKeyType="next"
                  returnKeyLabel="next"
                  label="Full Name"
                  onBlur={handleBlur("fullName")}
                  error={errors.fullName}
                  touched={touched.fullName}
                  onChangeText={handleChange("fullName")}
                  value={values.fullName}
                  type="text"
                  isEditable={isEditable}
                />
                <CustomInput
                  icon="mail"
                  placeholder="Enter your email"
                  autoCapitalize="none"
                  autoCompleteType="email"
                  keyboardType="email-address"
                  keyboardAppearance="dark"
                  returnKeyType="next"
                  returnKeyLabel="next"
                  label="Email"
                  onBlur={handleBlur("email")}
                  error={errors.email}
                  touched={touched.email}
                  onChangeText={handleChange("email")}
                  value={values.email}
                  type="text"
                  isEditable={isEditable}
                />
                <CustomInput
                  icon="location-sharp"
                  placeholder="Your Address"
                  autoCapitalize="none"
                  autoCompleteType="address"
                  keyboardType="email-address"
                  keyboardAppearance="dark"
                  returnKeyType="next"
                  returnKeyLabel="next"
                  label="Address"
                  onBlur={handleBlur("address")}
                  error={errors.address}
                  touched={touched.address}
                  onChangeText={handleChange("address")}
                  value={values.address}
                  type="text"
                  isEditable={isEditable}
                />
                <CustomInput
                  icon="call-outline"
                  placeholder="Phone"
                  autoCapitalize="none"
                  autoCompleteType="phoneNumber"
                  keyboardType="email-address"
                  keyboardAppearance="dark"
                  returnKeyType="next"
                  returnKeyLabel="next"
                  label="Phone Number"
                  onBlur={handleBlur("phoneNumber")}
                  error={errors.phoneNumber}
                  touched={touched.phoneNumber}
                  onChangeText={handleChange("phoneNumber")}
                  value={values.phoneNumber}
                  type="text"
                  isEditable={isEditable}
                />
                <CustomInput
                  icon="calendar"
                  placeholder="Date Of Birth"
                  label="Date Of Birth"
                  onBlur={handleBlur("dateOfBirth")}
                  error={errors.dateOfBirth}
                  touched={touched.dateOfBirth}
                  onChangeText={handleChange("dateOfBirth")}
                  value={formatDate(values.dateOfBirth)}
                  type="date"
                  isEditable={isEditable}
                />
              </View>
              {isEditable && (
                <View className="flex flex-row justify-between mx-5 my-4 ">
                  <CustomButton
                    text="Reject"
                    size={140}
                    bg={Colors.white}
                    onPress={() => router.back()}
                  />
                  <CustomButton
                    bg={Colors.primary}
                    size={140}
                    text="Save Changes"
                    onPress={() => {
                      handleEdit();
                      handleSubmit();
                    }}
                  />
                </View>
              )}
            </View>
          )}
        </Formik>
      </ScrollView>
    </CommonLayout>
  );
};

export default Page;
