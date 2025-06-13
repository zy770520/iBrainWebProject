export const removeEmptyFields = (obj) => {
  return Object.keys(obj).reduce((newObj, key) => {
    if (obj[key] !== "" || obj[key] !== undefined || obj[key] !== null) {
      newObj[key] = obj[key];
    }
    return newObj;
  }, {});
};
export const WebSocketBaseUrl = 'wss://192.168.8.156:3000/api';
export const EventSourceUrl = 'https://192.168.8.156:3000/api';
// export const WebSocketBaseUrl = `wss://${location.host}/api`;
// export const EventSourceUrl = `https://${location.host}/api`;
// export const WebSocketBaseUrl = 'wss://192.168.8.184:3000/api';
// export const EventSourceUrl = 'https://192.168.8.184:3000/api';
// export const WebSocketBaseUrl = 'wss://192.168.8.167:3000/api';
// export const EventSourceUrl = 'https://192.168.8.167:3000/api';



