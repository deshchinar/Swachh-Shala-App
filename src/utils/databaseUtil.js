import { getDatabase, set, ref } from 'firebase/database';
/**
 * @param {String} timeStamp
 * @param {String} schoolName
 * @param {String} imageName
 * @param {String} userPosition
 * @param {String} userAddress
 * @param {String} imageLabel
 * @param {String} downloadUrl
 * @returns {null}
 * @description Takes the necessary fields and creates the database reference for each entry in database with image URL for clean images
 */

export const createCleanEntry = async (schoolName, timeStamp, imageName, userPosition, imageLabel, downloadUrl) => {
    try {
        const database = await getDatabase();
        console.log(database);

        let schoolNameFormatted = schoolName.toLowerCase().replace(/\s+/g, '');

        const nodeName = `${schoolNameFormatted}_${timeStamp}`;
        console.log("NodeName", nodeName);
        await set(ref(database, `Images/clean/${schoolNameFormatted}/${nodeName}`), {
            School_Name: schoolName,
            Time_Stamp: timeStamp,
            Image_Name: imageName,
            User_Position: userPosition,
            Image_Label: imageLabel,
            Image_URL: downloadUrl
        });
    } catch (error) {
        console.log(error);
    }
};


/**
 * @param {String} timeStamp
 * @param {String} schoolName
 * @param {String} imageName
 * @param {String} userPosition
 * @param {String} userAddress
 * @param {String} imageLabel
 * @param {String} downloadUrl
 * @returns {null}
 * @description Takes the necessary fields and creates the database reference for each entry in database with image URL for dirty images
 */
export const createDirtyEntry = async (schoolName, timeStamp, imageName, userPosition, imageLabel, downloadUrl) => {
    try {
        const database = await getDatabase();
        console.log(database);

        let schoolNameFormatted = schoolName.toLowerCase().replace(/\s+/g, '');
        const nodeName = `${schoolNameFormatted}_${timeStamp}`;
        // console.log("NodeName", nodeName);

        await set(ref(database, `Images/dirty/${schoolNameFormatted}/${nodeName}`), {
            School_Name: schoolName,
            Time_Stamp: timeStamp,
            Image_Name: imageName,
            User_Position: userPosition,
            Image_Label: imageLabel,
            Image_URL: downloadUrl
        });
    } catch (error) {
        console.log(error);
    }
};