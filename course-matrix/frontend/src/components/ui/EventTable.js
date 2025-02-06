import React, {userState, useEffect, useState} from "react";
import {supabase} from "..\backend\src\db\setupDb.ts";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, Paper } from "@mui/material";

const EventTable = () => {
    const[events, setEvents] = useState([]);
    const[newEvent, setNewEvent] = useState({title:"", date:"", description:""});
    const[statusMessage, setStatusMessage] = userState("");

    //Fetch events from Supabase
    useEffect(() => {
        fetchEvents();
    },[]);

    const fetchEvents = async() => {
        try{
            const {data, error} = await supabase.from("events").select("*");
            if (error){
                setStatusMessage(error);
            } else {
                setEvents(data);
            }
        }catch(error){
            console.error("Error during Fetching events from Supabase:", error)
        }
    };

    //Add a new event
    const addEvent = async() => {
        try{
            const {data, error} = await supabase.from("events").insert([newEvent]);
            if (error){
                return setStatusMessage(error);
            } else {
                setEvents([...events,data[0]]);
                setNewEvent({title:"", date:"",description:""});
            }
        }catch(error){
            console.error("Error during Fetcjomg events from Supabase:", error)
        }
    };

    //Delete an event
    const deleteEvent = async(id) => {
        try{
            await supabase.from("events").delete().match([newEvent]);
            if (error){
                return setStatusMessage(error);
            } else {
                setEvents([...events,data[0]]);
                setNewEvent({title:"", date:"",description:""});
            }
        }catch(error){
            console.error("Error during Fetcjomg events from Supabase:", error)
        }
    };
}