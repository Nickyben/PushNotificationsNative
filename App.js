import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
    };
  },

});

export default function App() {
  const [pushToken, setPushToken] = useState();
  //this is done at app start especially for ios
  useEffect(() => {
    //get the notification permission initial state or value to check if it is already granted
    Permissions.getAsync(Permissions.NOTIFICATIONS)
      .then(response => {
        if (response.status !== 'granted') {
          return Permissions.askAsync(Permissions.NOTIFICATIONS);//asks for it if not already granted.
        }
        return response;//used to collect/return the response obj even if it is already granted
      })
      .then(response => {
        if (response.status !== 'granted') {
          throw new Error('Permission not granted!');
        }
      })
      .then(() => {
        console.log('About to get the token...')
        const tokenObj = Notifications.getExpoPushTokenAsync();
        return tokenObj;
      })
      .then((responseTokenObj) => {
        //the data actually contains an identifier for that particular device 
        //...where the app is installed and permission has been granted
        console.log(responseTokenObj); //"data": "ExponentPushToken[Yri9BcOfd************]",--> for me
        const responsePushToken = responseTokenObj.data;
        setPushToken(responsePushToken);
        //you can as well store the token
        //you can as well send a fetch('https://your-own-api.com') to you own api where you have some logic to receive the 
        //token and store it in the database
      })
      .catch((err) => {
        console.log(err);
        return null;
      });
  }, []);



  useEffect(() => {
    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(
      //this func runs when incoming notification is received and the app is running
      userResponse => {
        //you can run/exe something here with the notification details eg sent http request etc
        console.log(userResponse);//this obj contains details about that notification
      }
    );

    const foregroundSubscription = Notifications.addNotificationReceivedListener(
      //this func runs when incoming notification is received and the app is running
      notification => {
        //you can run/exe something here with the notification details
        console.log(notification);//this obj contains details about that notification
      }
    );
    return () => {
      foregroundSubscription.remove();
      backgroundSubscription.remove();

    }
  }, []);

  const triggerNotificationHandler = () => {
    //THIS IS FOR LOCAL NOTIFICATION
    // Notifications.scheduleNotificationAsync({
    //   content: { 
    //     title: 'My Fist Local Notification',
    //     body: 'The body of the Notification we are sending',
    //     data: { mySpecialData: "This is a special data" },
    //     color: '#77ccff',

    //   },
    //   trigger: {
    //     seconds: 2,

    //   }

    // });

    //THIS IS FOR PUSH NOTIFICATION (USING PUSH NOTIFICATION SERVERS AND EXPO SERVERS)
    fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip,deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: pushToken, //the device's push Token or id
        title: 'A push notification through the app',
        body: 'This is a push notification, you can tap it to see what it is all about',
        data: {
          anExtraData: 'This is an extra data for the push notification',
        }
      }),
    })
  };

  return (
    <View style={styles.container}>
      <Button title='Trigger Notification' onPress={triggerNotificationHandler} />
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
