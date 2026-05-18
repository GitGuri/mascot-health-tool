import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPhone, FaDirections, FaCalendarCheck, FaHospital, FaClinicMedical, FaSearch, FaFilter, FaHeartbeat } from 'react-icons/fa';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Reachout = () => {
  const [clinics, setClinics] = useState([]);
  const [filteredClinics, setFilteredClinics] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [loading, setLoading] = useState(true);

  const clinicTypes = ['All', 'HIV Research & Prevention Center', 'HIV Clinic', 'Referral Hospital', 'Municipal Clinic', 'Provincial Hospital', 'District Hospital'];

  useEffect(() => {
    fetchClinics();
  }, []);

  useEffect(() => {
    filterClinics();
  }, [searchTerm, selectedType, clinics]);

  const fetchClinics = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/clinics`);
      setClinics(response.data);
      setFilteredClinics(response.data);
    } catch (error) {
      console.error('Error fetching clinics:', error);
      const fallbackData = [
        { name: "CeSHHAR Zimbabwe - Harare", type: "HIV Research Center", address: "45 Van Praagh Ave, Harare", phone: "+263 242 748 577", services: ["HIV Testing", "PrEP", "Counseling"] },
        { name: "Sally Mugabe Central Hospital", type: "Referral Hospital", address: "Harare", phone: "+263 242 621 111", services: ["HIV Testing", "Maternity", "STI Treatment"] }
      ];
      setClinics(fallbackData);
      setFilteredClinics(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const filterClinics = () => {
    let filtered = clinics;
    
    if (selectedType !== 'All') {
      filtered = filtered.filter(c => c.type === selectedType);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.services?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredClinics(filtered);
  };

  const getTypeIcon = (type) => {
    if (type?.includes('HIV')) return <FaHeartbeat className="text-red-500" />;
    if (type?.includes('Hospital')) return <FaHospital className="text-blue-500" />;
    return <FaClinicMedical className="text-green-500" />;
  };

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleDirections = (address) => {
    window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank');
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-[#04342C] text-white p-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold">Reach Out</h1>
        <p className="text-sm text-white/70 mt-1">Find health services near you</p>
      </div>

      <div className="p-4 bg-white border-b border-gray-200 space-y-3">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, location, or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#04342C]"
          />
        </div>
        
        <div className="overflow-x-auto whitespace-nowrap">
          <div className="flex gap-2">
            {clinicTypes.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors flex items-center gap-1 ${
                  selectedType === type
                    ? 'bg-[#04342C] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FaFilter className="text-xs" />
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-[#04342C] border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading health facilities...</p>
          </div>
        ) : filteredClinics.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No facilities found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredClinics.map((clinic, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {getTypeIcon(clinic.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">{clinic.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{clinic.type}</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Open
                      </span>
                    </div>
                    
                    {clinic.address && (
                      <p className="text-sm text-gray-600 mt-2 flex items-start gap-1">
                        <span>📍</span> {clinic.address}
                      </p>
                    )}
                    
                    {clinic.services && clinic.services.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {clinic.services.slice(0, 3).map((service, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {service}
                          </span>
                        ))}
                        {clinic.services.length > 3 && (
                          <span className="text-xs text-gray-400">+{clinic.services.length - 3} more</span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-3">
                      {clinic.phone && (
                        <button
                          onClick={() => handleCall(clinic.phone)}
                          className="flex-1 bg-[#04342C] text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <FaPhone className="text-xs" /> Call
                        </button>
                      )}
                      <button
                        onClick={() => handleDirections(clinic.address)}
                        className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <FaDirections className="text-xs" /> Directions
                      </button>
                      <button className="border border-gray-300 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium">
                        <FaCalendarCheck />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reachout;