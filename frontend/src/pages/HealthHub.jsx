import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaExternalLinkAlt, FaSearch, FaNewspaper, FaHeartbeat, FaBaby } from 'react-icons/fa';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://mascot-backend.onrender.com';

const HealthHub = () => {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'HIV Prevention', 'Pregnancy Prevention', 'Sexual Health', 'General'];

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [searchTerm, selectedCategory, resources]);

  const fetchResources = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/resources`);
      setResources(response.data);
      setFilteredResources(response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
      const fallbackData = [
        { title: "National AIDS Council Zimbabwe", url: "https://www.nac.org.zw", category: "HIV Prevention", description: "Official HIV prevention resources", source: "NAC Zimbabwe" },
        { title: "UNFPA Zimbabwe", url: "https://zimbabwe.unfpa.org", category: "Pregnancy Prevention", description: "Family planning and reproductive health", source: "UNFPA" },
        { title: "CeSHHAR Zimbabwe", url: "https://ceshhar.org", category: "HIV Prevention", description: "HIV research and prevention", source: "CeSHHAR" }
      ];
      setResources(fallbackData);
      setFilteredResources(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredResources(filtered);
  };

  const getCategoryIcon = (category) => {
    if (category?.includes('HIV')) return <FaHeartbeat className="text-red-500" />;
    if (category?.includes('Pregnancy')) return <FaBaby className="text-pink-500" />;
    return <FaNewspaper className="text-blue-500" />;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-[#04342C] text-white p-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold">Health Hub</h1>
        <p className="text-sm text-white/70 mt-1">Trusted resources for students</p>
      </div>

      <div className="p-4 bg-white border-b border-gray-200">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#04342C]"
          />
        </div>
      </div>

      <div className="px-4 py-3 bg-white overflow-x-auto whitespace-nowrap border-b border-gray-200">
        <div className="flex gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#04342C] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-[#04342C] border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading resources...</p>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No resources found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredResources.map((resource, idx) => (
              <motion.a
                key={idx}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(resource.category)}
                      <span className="text-xs text-gray-500">{resource.category}</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">{resource.title}</h3>
                    {resource.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">{resource.description}</p>
                    )}
                    {resource.source && (
                      <p className="text-xs text-gray-400 mt-2">Source: {resource.source}</p>
                    )}
                  </div>
                  <FaExternalLinkAlt className="text-gray-400 text-sm ml-3 flex-shrink-0" />
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthHub;