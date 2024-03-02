import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  Pressable,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { Link, Stack } from "expo-router";
import RentalsHeader from "@/components/admin/header/RentalsHeader";
import StoreCard from "@/components/global/Card";
import EditStoreCard from "@/components/admin/components/EditStoreCard";
import BookedCard from "@/components/admin/components/BookedCard";

import { API } from "@/api/endpoints";
import { useGet } from "@/hooks";
import CommonProgress from "../../(modals)/commonLoader";

const Page = () => {
  const [tab, setTab] = useState("all");
  const spaceRentEndpoint = `${API.GetSpaceForRent}`;

  const { data: { data: spaceRentData } = {}, isLoading: spaceRentLoading } =
    useGet({ endpoint: spaceRentEndpoint });

  if (spaceRentLoading) {
    return (
      <View className="flex h-full flex-col justify-center items-center">
        <CommonProgress />
      </View>
    );
  }

  console.log("Length: ", spaceRentData?.data?.length);

  return (
    <View style={{}}>
      <Stack.Screen
        options={{
          header: () => <RentalsHeader tab={tab} setTab={setTab} />,
        }}
      />
      <View style={styles.container}>
        {tab === "all" && (
          <FlatList
            // Key extractor for efficient rendering
            keyExtractor={(item) => item._id} // Replace with your ID property
            data={spaceRentData?.data}
            renderItem={({ item }) => {
              return (
                // Render the appropriate card based on tab
                <View className="flex flex-col justify-center items-center bg-green-500">
                  {item?.length > 0 ? (
                    <EditStoreCard rentData={item} />
                  ) : (
                    <Text>No Data Found</Text>
                  )}
                </View>
              );
            }}
          />
        )}
        {tab === "booked" && <BookedCard />}
      </View>

      {/* <ScrollView className="">
        <View style={styles.container}>
          <View className="justify-center items-center  ">
            {tab === "all" && <EditStoreCard />}
            {tab === "booked" && <BookedCard />}
          </View>
          <View className="flex flex-row items-center justify-center py-2">
            <CustomButton
              text="Create New Spaces"
              size={350}
              // height={50}
              bg={Colors.primary}
              onPress={() => addnewSpace()}
            />
          </View>
        </View>
      </ScrollView> */}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    width: Dimensions.get("window").width * 0.97,
    //height:Dimensions.get('window').height,
    margin: 4,
    marginBottom: 20,
  },
});

export default Page;
