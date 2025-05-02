import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export const launchImagePicker = async () => {
    try {
        await checkMediaPermissions();

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5, // Lower quality for better performance
            exif: false, // Skip EXIF data to reduce memory usage
        });

        console.log('ImagePicker result type:', typeof result);
        console.log('ImagePicker result structure:', result ? Object.keys(result).join(', ') : 'null');
        
        if (!result.canceled && result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            console.log('Original URI from picker:', uri);
            
            // Ensure we have a valid URI for both platforms
            const normalizedUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
            
            // Verify the image file exists and is readable
            try {
                const fileInfo = await FileSystem.getInfoAsync(normalizedUri);
                console.log('File info:', JSON.stringify(fileInfo));
                
                if (!fileInfo.exists) {
                    console.error('File does not exist at path:', normalizedUri);
                    return null;
                }
                
                // For iOS, normalize back with file:// prefix for Firebase
                const finalUri = Platform.OS === 'ios' 
                    ? (normalizedUri.startsWith('file://') ? normalizedUri : `file://${normalizedUri}`) 
                    : normalizedUri;
                
                console.log('Final processed URI:', finalUri);
                return finalUri;
            } catch (fileError) {
                console.error('Error checking file:', fileError);
                return null;
            }
        } else {
            console.log('Image picking was canceled or no assets were selected');
            return null;
        }
    } catch (error) {
        console.error('Error in launchImagePicker:', error);
        return null;
    }
};

const checkMediaPermissions = async () => {
    if (Platform.OS !== 'web') {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            console.log('Permission result:', permissionResult);
            
            if (!permissionResult.granted) {
                alert('Sorry, we need camera roll permissions to make this work!');
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error checking permissions:', error);
            return false;
        }
    }
    return true;
};