import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Image, TouchableOpacity, Alert, Dimensions, ActivityIndicator, StyleSheet } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PermissionsAndroid } from 'react-native';
import { firebase } from '../config';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { checkOrRequestPermissionForLocation } from './utils/permissionUtil';
import Geolocation from '@react-native-community/geolocation';
import { createCleanEntry, createDirtyEntry } from './utils/databaseUtil';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const ImageUploader = ({ navigation }) => {

    const [schoolName, setSchoolName] = useState('');
    const [image, setImage] = useState(null);
    const [selectedOption, setSelectedOption] = useState('clean');
    const [isLoading, setIsLoading] = useState(false);
    const [userLocation, setUserLocation] = useState('');
    const [userAddress, setUserAddress] = useState('');
    const [imageName, setImageName] = useState('');
    const [fetchingLocation, setFetchingLocation] = useState(false);

    const getLatLong = () => {
        return new Promise((resolve, reject) => {
            if (Platform.OS === 'android') {
                Geolocation.getCurrentPosition(
                    (position) => {
                        const location = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        };
                        // console.log(typeof(formattedLatLong))
                        resolve(location);
                    },
                    (error) => {
                        console.error('Error getting user location:', error);
                        reject(error);
                    },
                    { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
                );
            } else {
                Geolocation.requestAuthorization();
                Geolocation.getCurrentPosition(
                    (position) => {
                        const location = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        };
                        const formattedLatLong = `${location.latitude},${location.longitude}`;
                        resolve(formattedLatLong);
                    },
                    (error) => {
                        console.error('Error getting user location:', error);
                        reject(error);
                    },
                    { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
                );
            }
        });
    };

    const fetchLocation = async () => {
        try {
            setFetchingLocation(true);
            const latlong = await getLatLong();
            // console.log("Latlong Received")
            // const location = await getUserPosition(String(latlong.latitude), String(latlong.longitude));
            // console.log("Address received")
            // let address = String(location.results[0].formatted_address);
            // setUserAddress(address);   
            setFetchingLocation(false);
        } catch (error) {
            console.error('Error fetching user location:', error);
        }
    };
    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const location = await Promise.race([
                    getLatLong(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Location fetch timeout')), 20000))
                ]);
                console.log("Got location",location);
                setUserLocation(location);
            } catch (error) {
                console.error('Error fetching user location:', error);
                // Set default location if there was an error
                setUserLocation({ latitude: 37.7749, longitude: -122.4194 }); // Example default location (San Francisco)
            }
        };
        fetchLocation();
    }, []);

    const handleChoosePhoto = async () => {
        Alert.alert(
            'Choose Photo',
            'Select photo from:',
            [
                {
                    text: 'Take Photo',
                    onPress: takePhoto,
                },
                {
                    text: 'Choose from Library',
                    onPress: chooseFromLibrary
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ],
            { cancelable: true }
        );
    };

    const chooseFromLibrary = async () => {
        const result = await launchImageLibrary();
        setImage(result.assets[0].uri);
    };

    const takePhoto = async () => {
        const result = await launchCamera();
        setImage(result?.assets[0]?.uri);
    };

    const handleUploadImage = async () => {
        if (!schoolName) {
            Alert.alert('Alert', 'Please Enter School Name');
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const timestamp = new Date().toISOString().replace(/[:.-]/g, '');
            console.log("received timestamp",timestamp)
            const response = await fetch(image);
            console.log("Image",image)
            const blob = await response.blob();
            console.log("blob",blob);
            const folder = selectedOption === 'clean' ? 'clean' : 'dirty';
            const fileName = `${schoolName}_${selectedOption}_${timestamp}.jpg`;
            setImageName(fileName);
            // Upload image to Firebase Storage
            const storageRef = firebase.storage().ref().child(folder);
            console.log("received storage ref",storageRef);
            const fileRef = storageRef.child(fileName);
            console.log("got file ref");
            try {
                await fileRef.put(blob);
            } catch (error) {
                console.log(error);
            }

            console.log("put call complete");
            const downloadUrl = await fileRef.getDownloadURL();
            console.log("received download url");
            // const latlong = await getLatLong();
            const userlocation = `${userLocation.latitude},${userLocation.longitude}`;
            console.log("userlocation while uploading", userlocation)
            console.log("Timestamp", timestamp)
            setIsLoading(false)

            // userAddress==""? await fetchLocation():null;

            setIsLoading(true)
            selectedOption === 'clean' ? createCleanEntry(schoolName, timestamp, fileName, userlocation, selectedOption, downloadUrl) : createDirtyEntry(schoolName, timestamp, fileName, userlocation, selectedOption, downloadUrl);
            setIsLoading(false);
            Alert.alert('Image and Data Uploaded Successfully', 'Thank you for your contribution!');
            navigation.goBack();
        } catch (error) {
            setIsLoading(false);
            Alert.alert('Error', JSON.stringify(error));
        }
    };


    const handleRemoveClick = () => {
        setImage(null);
    };

    return (
        <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#35374B' }}>
            <Text style={{ color: 'yellow', fontSize: windowHeight * 0.025, fontWeight: 'bold', marginTop: windowHeight * 0.01 }}>School Bathroom Cleanliness Initiative</Text>
            <View style={{ marginTop: windowHeight * 0.01 }}>
                <Image source={require('../src/assests/swachh-shala-logo.png')} style={{ width: windowWidth * 0.3, height: windowWidth * 0.3 }} />
            </View>
            <View style={{ alignItems: 'center', marginTop: windowHeight * 0.02 }}>
                <Text style={{ color: 'yellow', fontSize: windowHeight * 0.025, fontWeight: 'bold' }}>Enter School Name:</Text>
                <TextInput
                    style={{ height: windowHeight * 0.05, width: windowWidth * 0.9, borderColor: 'gray', borderWidth: 1, marginBottom: windowHeight * 0.01, marginTop: windowHeight * 0.02, borderRadius: windowHeight * 0.04, color: 'yellow' }}
                    placeholder="Enter School Name"
                    onChangeText={(text) => setSchoolName(text)}
                    value={schoolName}
                    placeholderTextColor={'yellow'}
                />
                {image && (
                    <Image
                        source={{ uri: image }}
                        style={{ width: windowWidth * 0.25, height: windowWidth * 0.25 }}
                    />
                )}
                {image && (
                    <TouchableOpacity style={{ marginTop: windowHeight * 0.02, backgroundColor: 'white', padding: windowHeight * 0.010, borderRadius: windowHeight * 0.02 }} onPress={handleRemoveClick}>
                        <Text style={{ color: 'black', fontWeight: 'bold' }}>remove</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity onPress={handleChoosePhoto} style={{ marginTop: windowHeight * 0.025, width: windowWidth * 0.5, height: windowHeight * 0.06, backgroundColor: '#704264', borderRadius: windowHeight * 0.04, alignItems: 'center', justifyContent: 'center', opacity: image ? 0.5 : 1 }} disabled={image ? true : false}>
                    <Text style={{ color: 'white' }}>Choose Image</Text>
                </TouchableOpacity>

                <Text style={{ marginTop: windowHeight * 0.025, color: 'yellow', fontSize: windowHeight * 0.025 }}>Your review about the Bathroom</Text>
                <View style={{ flexDirection: 'row', marginTop: windowHeight * 0.025 }}>
                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', marginRight: windowWidth * 0.05 }}
                        onPress={() => setSelectedOption('clean')}
                    >
                        <View style={{ width: windowWidth * 0.06, height: windowWidth * 0.06, borderRadius: windowWidth * 0.03, borderWidth: 2, marginRight: windowWidth * 0.02, backgroundColor: selectedOption === 'clean' ? 'green' : 'white' }}>
                            {selectedOption === 'clean' && <View style={{ flex: 1, backgroundColor: 'green', borderRadius: windowWidth * 0.03 }} />}
                        </View>
                        <Text style={{ fontSize: windowHeight * 0.025, color: 'yellow' }}>Clean</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', marginLeft: windowWidth * 0.05 }}
                        onPress={() => setSelectedOption('dirty')}
                    >
                        <View style={{ width: windowWidth * 0.06, height: windowWidth * 0.06, borderRadius: windowWidth * 0.03, borderWidth: 2, marginRight: windowWidth * 0.02, backgroundColor: selectedOption === 'dirty' ? 'red' : 'white' }}>
                            {selectedOption === 'dirty' && <View style={{ flex: 1, backgroundColor: 'red', borderRadius: windowWidth * 0.03 }} />}
                        </View>
                        <Text style={{ fontSize: windowHeight * 0.025, color: 'yellow' }}>Dirty</Text>
                    </TouchableOpacity>
                </View>
                {isLoading && (
                    <View style={styles.overlay}>
                        <ActivityIndicator size="large" color="yellow" />
                        <Text>Uploading Image...</Text>
                    </View>
                )}
                {fetchingLocation && (
                    <View style={styles.overlay}>
                        <ActivityIndicator size="large" color="yellow" />
                        <Text style={{ color: 'yellow' }}>Please Wait</Text>
                        <Text style={{ color: 'yellow' }}>Fetching Location...</Text>
                    </View>
                )}
                <TouchableOpacity onPress={handleUploadImage} disabled={!image || userLocation === ""} style={{ marginTop: windowHeight * 0.025, width: windowWidth * 0.5, height: windowHeight * 0.06, backgroundColor: '#704264', borderRadius: windowHeight * 0.04, alignItems: 'center', justifyContent: 'center', opacity: !image || userLocation === "" ? 0.5 : 1 }}>
                    <Text style={{ color: 'white' }}>{userLocation === "" ? "Fetching Location..." : "Upload Image"}</Text>
                </TouchableOpacity>
                <Text style={{ color: 'yellow', marginTop: hp('5%') }}>Powered By Chinar Deshpande</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        // backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        backgroundColor: 'grey',
    },
});

export default ImageUploader;