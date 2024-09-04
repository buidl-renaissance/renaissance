import AsyncStorage from "@react-native-async-storage/async-storage";
import { DAEvent } from "./interfaces";
import { createFormData, createFormDataForVideo } from "./utils/uploadImage";
import * as FileSystem from 'expo-file-system';

interface UserAttribution {
  id: number;
  name: string;
  value: string;
}

export interface Contact {
  id?: number;
  name: string;
  email: string;
  phone: string;
  cid?: string;
  public_name?: string;
  organization: string;
  bio?: string;
  portfolio?: string;
  attributions?: UserAttribution[];
}

export interface Event {
  id: number;
  cid: string;
  title: string;
  slug: string;
  start_date: string;
  end_date: string;
  venue: Venue;
}

export interface Venue {
  id: number;
  cid: string;
  title: string;
  slug: string;
  geo: {
    lat: number;
    lng: number;
  };
}

export interface DPoPEventRsvp {
  cid?: string;
  event_cid: string;
  user_cid: string;
}

export interface DPoPEventCheckIn {
  cid?: string;
  event_cid: string;
  user_cid: string;
  user?: User;
}

export interface User {
  cid: string;
  created_at: string;
  email: string;
  email_verified_at: string | null;
  id: number;
  name: string;
  phone: string | null;
  public_address: string | null;
  public_name: string | null;
  organization: string | null;
  updated_at: string;
}

export interface ContentSignature {
  content_id: string;
  signature: string;
  address: string;
}

const hostname = "https://api.detroiter.network";
// const hostname = 'http://localhost:9090';

export const isAuthorized = async () => {
  return (await AsyncStorage.getItem("DPoPToken")) ? true : false;
};

export const isAdmin = async () => {
  const contact = getContact();
  return contact.id === 1 ? true : false;
};

export const getContact = async (): Promise<Contact> => {
  const contact = await AsyncStorage.getItem("DPoPContact");
  return contact ? JSON.parse(contact) : null;
};

export const saveContact = async (contact: Contact) => {
  await AsyncStorage.setItem("DPoPContact", JSON.stringify(contact));
};

export const storeCheckIn = (checkIn: DPoPEventCheckIn) => {
  console.log("storeCheckIn: ", checkIn);
  AsyncStorage.setItem(
    `DPoPEvent-${checkIn.event_cid}-checkin`,
    JSON.stringify(checkIn)
  );
};

export const getCheckIn = async (event_cid: string) => {
  const checkIn = await AsyncStorage.getItem(`DPoPEvent-${event_cid}-checkin`);
  return checkIn ? JSON.parse(checkIn) : null;
};

const getDPoPToken = async () => {
  return AsyncStorage.getItem("DPoPToken");
};

const setDPoPToken = async (token: string) => {
  AsyncStorage.setItem("DPoPToken", token);
};

export const getUser = (): User => {
  const u = AsyncStorage.getItem("DPoPUser");
  return u ? JSON.parse(u) : null;
};

const setUser = (user: User) => {
  AsyncStorage.setItem("DPoPUser", JSON.stringify(user));
};

export const getUserId = async () => {
  const token = await getDPoPToken();
  if (!token) return 0;
  const jwtData = parseJwt(token);
  console.log("jwtData: ", jwtData);
  return jwtData.sub;
};

const authorizedRequest = async (endpoint: string, options: any = {}) => {
  const headers = options?.headers ?? {};
  const DPoPToken = await getDPoPToken();
  if (DPoPToken) headers["Authorization"] = `Bearer ${DPoPToken}`;
  options.headers = headers;
  // const res = await fetch(`http://localhost:9090/api/${endpoint}`, options);
  const res = await fetch(`${hostname}/api/${endpoint}`, options);
  return await res.json();
};

export const login = async (email: string, password: string) => {
  const result = await (
    await fetch(`${hostname}/api/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "content-type": "application/json" },
    })
  ).json();
  if (result.authorization.token) {
    setDPoPToken(result.authorization.token);
  }
  if (result.user) {
    setUser(result.user);
  }
  return result;
};

interface RegisterParams extends Contact {
  password: string;
}

export const saveEvent = async (event: DAEvent) => {
  console.log("SAVE EVENT!!", {
    description: event.description,
    end_date: event.end_date,
    start_date: event.start_date,
    title: event.title,
    venue_id: event.venue?.id,
  });
  const result = await (
    await fetch(`${hostname}/api/event/${event.id}`, {
      method: "POST",
      body: JSON.stringify({
        description: event.description ?? "",
        end_date: event.end_date,
        start_date: event.start_date,
        title: event.title,
        venue_id: event.venue?.id,
      }),
      headers: { "content-type": "application/json" },
    })
  ).json();
  console.log("SAVED EVENT: ", result);
  return result;
};

export const uploadImage = async (image) => {
  const info = await FileSystem.getInfoAsync(image.uri as string);
  const exif = image.exif
    ? image.exif
    : { ...info, width: image.width, height: image.height };
  const form = createFormData(image, {
    exif: JSON.stringify(exif),
  });
  const result = await (
    await fetch(`${hostname}/api/upload-media`, {
      body: form,
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  ).json();
  console.log("uploadImage: ", result);
  return result;
};

export const uploadVideo = async (video, meta) => {
  const form = createFormDataForVideo(video, {
    exif: JSON.stringify(meta),
  });
  const result = await (
    await fetch(`${hostname}/api/upload-media`, {
      body: form,
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  ).json();
  console.log("uploadVideo: ", result);
  return result;
};

export const createContent = async (
  caption,
  timestamp,
  url,
  artwork,
  width,
  height
) => {
  const result = await (
    await fetch(`${hostname}/api/content`, {
      method: "POST",
      body: JSON.stringify({
        caption,
        timestamp,
        url,
        artwork,
        width,
        height,
      }),
      headers: { "content-type": "application/json" },
    })
  ).json();
  console.log("SAVED CONTENT: ", result);
  return result;
};

export const createEvent = async (
  title,
  description,
  image,
  venue,
  start_date,
  end_date
) => {
  console.log("CREATE EVENT!!", {
    description: description,
    end_date: end_date,
    image: image,
    start_date: start_date,
    title: title,
    venue_id: venue?.id,
  });
  const result = await (
    await fetch(`${hostname}/api/event`, {
      method: "POST",
      body: JSON.stringify({
        description: description ?? "",
        end_date: end_date,
        image: image,
        start_date: start_date,
        title: title,
        venue_id: venue?.id,
      }),
      headers: { "content-type": "application/json" },
    })
  ).json();
  console.log("SAVED EVENT: ", result);
  return result;
};

export const getFlyers = async () => {
  const result = await (await fetch(`${hostname}/api/flyers`)).json();
  return result.data;
};

export const createFlyer = async (image) => {
  const contact = await getContact();
  // console.log("CREATE FLYER: ", {
  //   data: {
  //     image: image,
  //   },
  //   user_id: contact.id,
  // });
  const result = await (
    await fetch(`${hostname}/api/flyer`, {
      method: "POST",
      body: JSON.stringify({
        data: {
          imageUrl: image,
        },
        user_id: contact.id,
      }),
      headers: { "content-type": "application/json" },
    })
  ).json();
  // console.log("SUBMITTED FLYER: ", result);
  return result;
};

export const register = async (params: RegisterParams) => {
  const result = await (
    await fetch(`${hostname}/api/register`, {
      method: "POST",
      body: JSON.stringify(params),
      headers: { "content-type": "application/json" },
    })
  ).json();
  if (result.authorization.token) {
    setDPoPToken(result.authorization.token);
  }
  if (result.user) {
    setUser(result.user);
  }
  return result;
};

export const getEvent = async (event: string) => {
  const result = await (await fetch(`${hostname}/api/event/${event}`)).json();
  return result.data;
};

export const getArtwork = async (artwork: string) => {
  const result = await (
    await fetch(`${hostname}/api/artwork/${artwork}`)
  ).json();
  return result;
};

export const getContent = async (cid: string) => {
  const result = await (
    await fetch(`https://dpop.nyc3.digitaloceanspaces.com/${cid}`)
  ).json();
  return result;
};

export const submitEventCheckIn = async (
  event: string,
  contact: Contact,
  user_cid: string
) => {
  const data = contact;
  data["attestator"] = user_cid;
  const result = await authorizedRequest(`event/${event}/check-in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: contact ? JSON.stringify(contact) : null,
  });
  if (result?.data?.user_cid) storeCheckIn(result.data);
  return result?.data;
};

export const submitEventComment = async (event: DAEvent, text: string) => {
  const contact = await getContact();
  // console.log(
  //   `event/${event.id}/comment`,
  //   text,
  //   "CID: ",
  //   contact.cid,
  //   JSON.stringify({
  //     text: text,
  //     user_cid: contact.cid,
  //   })
  // );
  const result = await authorizedRequest(`event/${event.id}/comment`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: text,
      user_cid: contact.cid,
    }),
  });
  console.log("EVENT COMMENT: ", result);
  return result.data;
  // return [];
};

export const createUser = async (contact: Contact): Promise<Contact> => {
  const result = await authorizedRequest(`user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: contact ? JSON.stringify(contact) : null,
  });
  console.log("RESULT: ", result);
  return result?.data;
};

export const submitEventRsvp = async (event: string, status?: string) => {
  const contact = await getContact();
  const body = contact ?? {};
  body["status"] = status;
  const result = await authorizedRequest(`event/${event}/rsvp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return result.data;
};

export const submitSignedEventRsvp = async (
  event: string,
  cs: ContentSignature
) => {
  const result = await authorizedRequest(`event/${event}/signed-rsvp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cs),
  });
  return result.data;
};

export const getRsvps = async () => {
  const result = await authorizedRequest("rsvps");
  return result.data;
};

export const inRSVPs = (rsvps) => {
  const userId = getUserId();
  return rsvps.filter((rsvp) => rsvp.user.id == userId)?.length ? true : false;
};

const parseJwt = (token) => {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map((c) => {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
  return JSON.parse(jsonPayload);
};
