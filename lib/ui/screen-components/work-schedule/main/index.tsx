import SpinnerComponent from "@/lib/ui/useable-components/spinner";
import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from "react-native";
import { Switch } from "react-native-switch";

const { width } = Dimensions.get("window");

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Generate 24-hour time slots (every 15 minutes)
const generateTimeSlots = () => {
  const times = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const formattedTime = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      times.push(formattedTime);
    }
  }
  return times;
};
const timeOptions = generateTimeSlots();

export default function ScheduleScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [schedule, setSchedule] = useState(
    daysOfWeek.map((day) => ({
      day,
      enabled: false,
      slots: [{ startTime: "09:00", endTime: "17:00" }],
    })),
  );
  const [dropdown, setDropdown] = useState<{
    dayIndex: number;
    slotIndex: number;
    type: "start" | "end";
  } | null>(null);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current; // Opacity
  const translateYAnim = useRef(new Animated.Value(20)).current; // Slide up
  const parallaxAnim = useRef(new Animated.Value(0)).current; // Parallax effect

  // Handlers
  const toggleDay = (index: number) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[index].enabled = !updatedSchedule[index].enabled;
    setSchedule(updatedSchedule);
  };

  const updateTime = (
    dayIndex: number,
    slotIndex: number,
    type: "startTime" | "endTime",
    value: string,
  ) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[dayIndex].slots[slotIndex][type] = value;
    setSchedule(updatedSchedule);
    closeDropdown(); // Close dropdown after selection
  };

  const addSlot = (dayIndex: number) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[dayIndex].slots.push({
      startTime: "09:00",
      endTime: "17:00",
    });
    setSchedule(updatedSchedule);
  };

  const removeSlot = (dayIndex: number, slotIndex: number) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[dayIndex].slots.splice(slotIndex, 1);
    setSchedule(updatedSchedule);
  };

  const closeDropdown = () => {
    if (dropdown) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 20,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setDropdown(null); // Hide dropdown after animation
      });
    }
  };

  const onHandlerSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      console.log(JSON.stringify(schedule, null, 2));
      setIsLoading(false);
    }, 2000);
  };

  // Handle dropdown animations
  useEffect(() => {
    if (dropdown) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [dropdown]);

  return (
    <TouchableWithoutFeedback onPress={closeDropdown}>
      <View className="flex-1 items-center">
        <View className="p-2 bg-white h-[80%] w-full">
          <FlatList
            data={schedule}
            keyExtractor={(item) => item.day}
            renderItem={({ item, index }) => (
              <View className="bg-gray-200 p-4 mb-3 rounded-lg">
                {/* Day Header with Toggle */}
                <View className="flex-row justify-between items-center">
                  <Text className="text-lg font-bold">{item.day}</Text>
                  <Switch
                    value={item.enabled}
                    onValueChange={() => toggleDay(index)}
                    activeText={""}
                    inActiveText={""}
                    circleSize={20}
                    barHeight={25}
                    backgroundActive={"#4CAF50"}
                    backgroundInactive={"#ccc"}
                    circleBorderWidth={0}
                  />
                </View>

                {/* Time Slots */}
                {item.enabled && (
                  <View className="mt-2">
                    {item.slots.map((slot, slotIndex) => (
                      <View
                        key={slotIndex}
                        className="flex-row items-center justify-between mt-2 gap-x-2"
                      >
                        {/* Start Time Button */}
                        <TouchableOpacity
                          onPress={() =>
                            setDropdown({
                              dayIndex: index,
                              slotIndex,
                              type: "start",
                            })
                          }
                          className="w-[40%]  bg-white border border-gray-300 p-2 rounded-md"
                        >
                          <Text className="text-center">{slot.startTime}</Text>
                        </TouchableOpacity>

                        <Text className="mx-">-</Text>

                        {/* End Time Button */}
                        <TouchableOpacity
                          onPress={() =>
                            setDropdown({
                              dayIndex: index,
                              slotIndex,
                              type: "end",
                            })
                          }
                          className="w-[40%] bg-white border border-gray-300 p-2 rounded-md"
                        >
                          <Text className="text-center">{slot.endTime}</Text>
                        </TouchableOpacity>

                        {/* Remove Slot Button */}
                        {item.slots.length > 1 && slotIndex !== 0 && (
                          <TouchableOpacity
                            onPress={() => removeSlot(index, slotIndex)}
                            className="w-8 h-8 justify-center items-center border border-red-600 rounded-full"
                          >
                            <Text className="text-red-600 font-bold">−</Text>
                          </TouchableOpacity>
                        )}

                        {/* Add Slot Button */}
                        {slotIndex === 0 && (
                          <TouchableOpacity
                            onPress={() => addSlot(index)}
                            className="w-8 h-8 justify-center items-center border border-green-500 rounded-full"
                          >
                            <Text className="text-green-500 font-bold text-center">
                              +
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          />
        </View>
        <TouchableOpacity
          className="h-12 w-full bg-green-500 rounded-3xl py-3"
          style={{ width: width * 0.9 }}
          onPress={() => onHandlerSubmit()}
        >
          {isLoading ? (
            <SpinnerComponent />
          ) : (
            <Text className="text-center text-white text-lg font-medium">
              Update Schedule
            </Text>
          )}
        </TouchableOpacity>

        {/* Animated Dropdown */}
        {dropdown && (
          <Animated.View
            className="mb-[6rem]"
            style={{
              position: "absolute",
              bottom: -80,
              left: 5,
              right: 5,
              backgroundColor: "white",
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowRadius: 5,
              borderRadius: 8,
              padding: 10,
              opacity: fadeAnim,

              transform: [
                { translateY: translateYAnim },
                {
                  translateY: parallaxAnim.interpolate({
                    inputRange: [0, 300], // Adjust based on your dropdown height
                    outputRange: [0, -30], // Parallax effect range
                    extrapolate: "clamp",
                  }),
                },
              ],
            }}
          >
            <Text className="font-[Inter] text-lg font-bold mb-2">
              Select Time Slot
            </Text>
            <ScrollView
              style={{ maxHeight: 300 }}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: parallaxAnim } } }],
                { useNativeDriver: false },
              )}
              scrollEventThrottle={16}
            >
              {timeOptions.map((time) => (
                <TouchableOpacity
                  key={time}
                  onPress={() =>
                    updateTime(
                      dropdown.dayIndex,
                      dropdown.slotIndex,
                      dropdown.type === "start" ? "startTime" : "endTime",
                      time,
                    )
                  }
                  className="p-2 border-b border-gray-300"
                >
                  <Text className="font-[Inter] text-center text-lg">
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}
