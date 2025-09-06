import Modal from 'react-modal';
import { FaFacebook, FaWhatsapp, FaTwitter, FaLink } from 'react-icons/fa';
import { GoCopy } from "react-icons/go";

const ShareModal = ({ isShareModalOpen, setIsShareModalOpen, post, darkMode }) => {
    const baseUrl = window.location.origin;
    const postUrl = `${baseUrl}/home/post/shared/${post?._id}`;
    const encodedUrl = encodeURIComponent(postUrl);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(postUrl);
    setIsShareModalOpen(false);
  };

  const handleSocialShare = (url) => {
    window.open(url, '_blank');
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: <FaWhatsapp className="text-green-500" />,
      url: `https://wa.me/?text=${encodedUrl}`,
      action: null
    },
    {
      name: 'Facebook',
      icon: <FaFacebook className="text-blue-600" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      action: null
    },
    {
      name: 'Twitter',
      icon: <FaTwitter className="text-blue-400" />,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}`,
      action: null
    },
    {
      name: 'Copy Link',
      icon: <FaLink />,
      url: null,
      action: copyToClipboard
    }
  ];

  return (
    <Modal
      isOpen={isShareModalOpen}
      onRequestClose={() => {
        setIsShareModalOpen(false);
      }}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
      className={`w-[95%] max-w-md sm:w-120 h-auto sm:h-65 select-none ${darkMode ? "bg-neutral-800 text-white" : "bg-white"} p-4 sm:p-5 rounded-xl shadow-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 outline-none`}
      overlayClassName={`fixed inset-0 ${darkMode ? "bg-black/60" : "bg-gray-500/50"} z-50 flex justify-center items-center`}
    >
      <div className="w-full">
        <div className={`text-lg sm:text-2xl font-bold flex justify-center mb-3 sm:mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>Share With Friends</div>
        
        <div className="mb-2">
          <div className={`font-semibold mb-2 text-sm sm:text-base ${darkMode ? "text-white" : "text-gray-900"}`}>Copy Link:</div>
          <div className={`w-full h-9 sm:h-10 px-2 sm:px-3 ${darkMode ? "bg-neutral-700" : "bg-neutral-200"} flex justify-between items-center rounded`}>
            <div className={`flex-1 text-xs sm:text-sm truncate pr-2 ${darkMode ? "text-neutral-300" : "text-gray-700"}`}>{postUrl}</div>
            <div className="h-full flex justify-center items-center">
              <GoCopy 
                className={`cursor-pointer ${darkMode ? "text-neutral-400 hover:text-blue-400" : "hover:text-blue-500"} transition-colors`}
                size={window.innerWidth < 640 ? 16 : 20}
                onClick={copyToClipboard}
              />
            </div>
          </div>
        </div>

        <div className="mt-3 sm:mt-4">
          <div className={`font-semibold mb-2 text-sm sm:text-base ${darkMode ? "text-white" : "text-gray-900"}`}>Share to:</div>
          <div className="w-full flex items-center justify-around">
            {shareOptions.map((option, index) => (
              <div 
                key={index}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex justify-center items-center cursor-pointer ${darkMode ? "hover:bg-neutral-700" : "hover:bg-gray-100"} transition-colors`}
                onClick={() => {
                  if (option.action) {
                    option.action();
                  } else if (option.url) {
                    handleSocialShare(option.url);
                  }
                }}
              >
                <div className="text-2xl sm:text-4xl">
                  {option.icon}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ShareModal;