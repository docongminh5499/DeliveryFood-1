import React, { Component } from "react";
import { Text, View, SafeAreaView, FlatList, Image, TouchableOpacity, ImageBackground, ScrollView } from "react-native";
import { Header, Icon } from "react-native-elements";
import Anchor from "./anchor";
import Login from "./login";
import Register from "./register";
import firebase from 'react-native-firebase';
import { notification, flexStyle, loginStyle, CartStyle, accountStyle } from "../Style/style";
import { createStackNavigator, createAppContainer,  } from "react-navigation";
import NetInfo from "@react-native-community/netinfo";
import { SkypeIndicator } from 'react-native-indicators';

// ------------Notification if not login ----------------------------------------------------------------
class NotLogIn extends Component
{
  static navigationOptions = { header: null };
    render()
    {
        return (
          <View style={{flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white"}}>
                <Image
                    source={require("../Media/icon/bell.png")}
                    style={{width: 100, height: 100, marginBottom: "2%"}}
                 />
                <Text>Have account?</Text>
                <Anchor
                    text="Click here to login"
                    textStyle={{fontWeight: "bold", color: "white"}}
                    wrapperStyle={{ borderRadius: 5, backgroundColor: "gray", marginTop: "3%"}}
                    underlayColor="rgba(0, 0, 0, 0.6)"
                    handleOnPress={ ()=> {this.props.navigation.navigate("Login")} }
                />
          </View>
      )}
}



class NotLogInNav extends Component
{
  render()
  {
        const Nav = createAppContainer(createStackNavigator({
              Home: { screen: NotLogIn },
              Login: { screen: Login },
              SignUp: { screen: Register }
          },
          {
              initialRouteName: "Home",
          }));
          return (<Nav />);
  }
}
//--------------- Item -----------------------------------------------------------------------------------
export class NotificationItem extends Component
{
      constructor(props)
      {
            super(props);
            this.state = { title: '', time: '', content: '' };
      }

      componentDidMount()
      {
            const { id } = this.props;
            firebase.firestore().collection("Notification").doc(id).get().then(data=>{
                  this.setState({
                        title: data.data().Title,
                        time: data.data().Time,
                        content: data.data().Content
                  });
            });
      }

      render()
      {
            return (
              <View style={ notification.itemContainer }>
                  <View style={ notification.titleItemWrapper }>
                        <Icon
                              type="material-community"
                              name="android-messages"
                              color="#0078D7"
                              size={30}
                              style={{width:"20%"}}
                        />
                        <View style={{width: "75%", marginLeft: "5%"}}>
                                <Text style={ notification.titleText }>{ this.state.title }</Text>
                                <Text style={ notification.timeText }>{ this.state.time }</Text>
                        </View>
                  </View>
                  <View style={ notification.contentItem }>
                        <Text>{ this.state.content }</Text>
                  </View>
              </View>
          )}
}



export default class NotificationPage extends Component
{
  constructor(props)
  {
          super(props);
          this.state = {
                isConnected: false,
                user: firebase.auth().currentUser,
                data: [ ],
                isEmpty: true,
                isLoading: true,
          };
  }

getData()
  {
      if (this.state.user)
      {
          firebase.firestore().collection("Notification").where("UID", "==", this.state.user.uid).get().then(doc=>{
                  doc.forEach(item=>{
                        let temp = this.state.data;
                        temp.push({key: item.id, time: item.data().Time});
                        this.setState({ data: temp, isEmpty: false, isLoading: false});
                  });
          });
      }
  }

  async componentDidMount()
  {
          NetInfo.addEventListener('connectionChange', (data)=>{
                if (data.type === "unknown" || data.type === "none")
                        this.setState({isConnected: false});
                else
                {
                        if (this.state.isEmpty && !this.state.isLoading)
                                this.getData();
                        this.setState({isConnected: true});
                }
          });

          this.state.user && firebase.firestore().collection("Notification").where("UID", "==", this.state.user.uid).onSnapshot(async query=>{
                await this.setState({ data: [] });
                this.getData();
          });
          const isConnected = await NetInfo.isConnected.fetch();
          if (isConnected) this.setState({ isConnected: true });
          else this.setState({isEmpty: true});
          setTimeout(()=>this.setState({ isLoading: false }), 500);
  }

  render()
  {
    if (this.state.isLoading)
    {
      return (
        <View style={{ display: "flex",justifyContent: 'center', alignItems: 'center', flex: 1, backgroundColor: "white"}}>
              <View style={{ height: "20%", backgroundColor: "white"}}>
                      <SkypeIndicator />
                      <Text style={{ width: "100%", fontWeight: "bold", fontSize: 18, textAlign: "center"}}>LOADING...</Text>
              </View>
         </View>
      );
    }
    else if (this.state.user && this.state.isConnected)
            if (this.state.isEmpty)
                return (
                    <View style={{flex: 1}}>
                       <Header centerComponent={{ text: 'NOTIFICATIONS', style: notification.headerTitle }} backgroundColor="#006727" />
                            <View style={{ width: "100%", height: "87%", backgroundColor: "white"}}>
                                <View style={{flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white"}}>
                                    <Image source={require("../Media/icon/Social_Icon.gif")} style={{width: 100, height: 100, marginBottom: "2%"}} />
                                    <Text style={{fontSize: 16, fontWeight: "bold", marginTop: 20}}>You don't have any notification.</Text>
                                </View>
                            </View>
                    </View>);
              else
                    return (
                            <View>
                                  <Header centerComponent={{ text: 'NOTIFICATIONS', style: notification.headerTitle }}  backgroundColor="#5B9642" />
                                  <View style={{ width: "100%", height: "87%"}}>
                                        <FlatList
                                              contentContainerStyle={ [flexStyle.wrapper, {marginVertical: 10}] }
                                              showsVerticalScrollIndicator={false}
                                              data = { this.state.data.sort((a, b)=> new Date(b.time) - new Date(a.time) ) }
                                              renderItem={ ({item})=>( <NotificationItem  id={ item.key } /> )}
                                          />
                                </View>
                            </View>);
   else if (!this.state.user) return (<NotLogInNav />);
   else
        if (this.state.isEmpty)
               return (
                     <View style={{flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white"}}>
                           <Image
                               source={require("../Media/icon/noWF.png")}
                               style={{width: 100, height: 100, marginBottom: "2%"}}
                            />
                           <Text style={{fontSize: 16, fontWeight: "bold"}}>Please check your internet connection.</Text>
                     </View>
              );
         else
         return (
                 <View>
                       <Header centerComponent={{ text: 'NOTIFICATIONS', style: notification.headerTitle }}  backgroundColor="#5B9642" />
                       <View style={{ width: "100%", height: "87%"}}>
                             <FlatList
                                   contentContainerStyle={ [flexStyle.wrapper, {marginVertical: 10}] }
                                   showsVerticalScrollIndicator={false}
                                   data = {this.state.data}
                                   renderItem={ ({item})=>( <NotificationItem  id={ item.key } /> )}
                               />
                     </View>
                 </View>);
   }
}
