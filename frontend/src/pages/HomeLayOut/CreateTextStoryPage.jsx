import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for programmatic navigation
import { ArrowLeft } from "lucide-react"; // For a back button icon
import { FaChevronRight } from "react-icons/fa";
import { FaChevronLeft } from "react-icons/fa";
import axios from "axios";

const CreateTextStoryPage = ({ darkMode }) => {
  const [textStory, setTextStory] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("");
  const navigate = useNavigate(); // Hook to get the navigate function

  // Function to generate a random vibrant color
  const generateRandomColor = () => {
    const hue = Math.floor(Math.random() * 360); // 0-360 for hue
    const saturation = 70 + Math.floor(Math.random() * 30); // 70-100 for saturation
    const lightness = 50 + Math.floor(Math.random() * 10); // 50-60 for lightness
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const addStory = async()=>{
    try {
      navigate('/home')
      setTextStory('')
      const res = await axios.post('http://localhost:8000/story/create', {caption:textStory}, {
        withCredentials: true, // for cookies/session
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(res.data);
    }catch(err){
      console.log(err);
    }
  }

  useEffect(() => {
    // Set a random background color when the component mounts
    setBackgroundColor(generateRandomColor());
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleTextChange = (e) => {
    setTextStory(e.target.value);
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between items-center p-4 transition-colors duration-500`}
      style={{ backgroundColor: backgroundColor }}
    >
      {/* Header with back button */}
      <div className="w-full flex justify-between items-center p-2">
        <button
          onClick={() => navigate(-1)} // Go back to the previous page
          className="p-2 rounded-full bg-white flex justify-center items-center cursor-pointer bg-opacity-20 hover:bg-opacity-30 transition-all duration-200"
          aria-label="Go back"
        >
          <FaChevronLeft  size={24}  />
        </button>
        <h2 className="text-white text-xl font-bold">Create Text Story</h2>
      </div>

      {/* Centered Input Area */}
      <div className="flex-grow flex justify-center items-center w-full max-w-lg mx-auto">
        <textarea
          value={textStory}
          onChange={handleTextChange}
          placeholder="Start typing your story..."
          className={`w-full h-48 p-4 hide-scrollbar text-center text-2xl placeholder-white placeholder-opacity-70 rounded-lg resize-none focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50 transition-all duration-300
            ${darkMode ? "bg-neutral-800 text-white" : "bg-white text-gray-800"} bg-opacity-30`}
          style={{ color: darkMode ? 'white' : 'black' }} // Ensure text color is readable against random backgrounds
        />
      </div>

      
      <div className="w-full h-20 flex justify-end px-5 items-center">
        <button 
        onClick={()=>{
          addStory()
        }}
        className="h-12 bg-green-300 transform hover:scale-110 transition-all duration-300 cursor-pointer rounded-full w-12 flex justify-center  items-center"><FaChevronRight size={30}/></button> 
      </div>
    </div>
  );
};

export default CreateTextStoryPage;