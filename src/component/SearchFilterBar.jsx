// SearchFilterBar.jsx

import React, { useEffect, useState } from "react";
import { Search, Users, User, X } from "lucide-react";
import axiosInspector from "../http/axiosMain.js";
import Filter from "../assets/Frame.svg"

// Reusable pill‐toggle section with custom bg on selected/unselected
const FilterSection = ({ label, options, selected, onToggle }) => (
  <div className="mb-6">
    <p className="text-sm text-pink-500 font-medium mb-2">{label}</p>
    <div className="flex flex-wrap gap-2">
      {options.map((item) => {
        const isActive = selected.includes(item);
        return (
          <button
            key={item}
            onClick={() => onToggle(item)}
            className={`
              px-4 py-1 text-sm rounded-full
              ${isActive
                ? "bg-[linear-gradient(87.11deg,_#00A3E0_4.15%,_#00D4FF_81.96%)] text-white"
                : "bg-[#F2F4F7] text-gray-700 hover:bg-gray-200"
              }
            `}
          >
            {item}
          </button>
        );
      })}
    </div>
  </div>
);

export default function SearchFilterBar({ setProfiles, setLoading }) {
  // ─── State Hooks ─────────────────────────────────────────────────────
  const [show, setShow] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [distanceRange, setDistanceRange] = useState(0);

  // dual‐handle age slider
  const MIN_AGE = 21;
  const MAX_AGE = 70;
  const [ageMin, setAgeMin] = useState();
  const [ageMax, setAgeMax] = useState();
  const pct = (v) => ((v - MIN_AGE) / (MAX_AGE - MIN_AGE)) * 100;

  const [gender, setGender] = useState(""); // "", "Male", "Female"
  const [interests, setInterests] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [religions, setReligions] = useState([]);
  const [matchIntent, setMatchIntent] = useState("");
  const [isVerified, setIsVerified] = useState(null); // true / false / null

  // ─── Helpers ─────────────────────────────────────────────────────────
  const resetFilters = () => {
    setLoading(true);
    axiosInspector
      .get("/users/matches?start=0&limit=8")
      .then((res) => {
        setProfiles(res.data.list || []);
      })
      .catch(() => { })
      .finally(() => {
        setLoading(false);
        setSearchTerm("");
        setDistanceRange(0);
        setAgeMin(MIN_AGE);
        setAgeMax(MAX_AGE);
        setGender("");
        setInterests([]);
        setLanguages([]);
        setReligions([]);
        setMatchIntent("");
        setIsVerified(null);
        setShow(false);
      });
  };

  const toggleArray = (arr, setArr, val) =>
    arr.includes(val)
      ? setArr(arr.filter((x) => x !== val))
      : setArr([...arr, val]);
  const toggleInterest = (v) => toggleArray(interests, setInterests, v);
  const toggleLanguage = (v) => toggleArray(languages, setLanguages, v);
  const toggleReligion = (v) => toggleArray(religions, setReligions, v);

  const applyFilters = async () => {
    setLoading(true);
    try {
      const params = {
        start: 0,
        limit: 8,
        search: searchTerm || undefined,
        min_age: ageMin || undefined,
        max_age: ageMax || undefined,
        distance: distanceRange || undefined,
        gender: gender || undefined,
        interests: interests.length ? interests : undefined,
        languages: languages.length ? languages : undefined,
        religions: religions.length ? religions : undefined,
        match_intent: matchIntent || undefined,
        is_verified: isVerified,
      };
      const { data } = await axiosInspector.get("/users/matches", { params });
      setProfiles(data.list || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
    setShow(false);
  };

  //search after enter three character
  useEffect(() => {
    if (searchTerm.length >= 3) {
      applyFilters();
    }
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value); // let useEffect handle the filter
    console.log("seeee", searchTerm);

  };

  const applyGender = async (gender) => {
    setLoading(true);
    try {
      const params = {
        start: 0,
        limit: 8,
        search: searchTerm || undefined,
        min_age: ageMin || undefined,
        max_age: ageMax || undefined,
        distance: distanceRange || undefined,
        gender: gender || undefined,
        interests: interests.length ? interests : undefined,
        languages: languages.length ? languages : undefined,
        religions: religions.length ? religions : undefined,
        match_intent: matchIntent || undefined,
        is_verified: isVerified,
      };
      const { data } = await axiosInspector.get("/users/matches", { params });
      setProfiles(data.list || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
    setShow(false);
  };
  return (
    <>
      {/* ─── Top Search Bar ─────────────────────────────────────────────── */}
      <div className="w-full flex flex-wrap items-center gap-4 md:gap-6 px-4 md:px-8 py-4 bg-white shadow">
        {/* Search input */}
        <div className="flex items-center flex-grow md:flex-none md:w-[500px] border border-gray-200 rounded-full px-4 py-2" style={{ height: "60px" }}>
          <input
            type="text"
            placeholder="Search by name..."
            className="flex-grow outline-none text-sm text-gray-700"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Search className="w-4 h-4 text-gray-400" />
        </div>

        {/* Gender toggles */}
        <div className="flex flex-wrap items-center gap-4 md:gap-8 pl-0 md:pl-8 text-sm font-medium text-gray-700">
          {["Random", "Male", "Female"].map((g, index) => (
            <span
              key={g}
              onClick={() => {
                setGender(g);
                applyGender(g);
              }}
              className={`flex items-center gap-1 cursor-pointer ${gender === g ? "text-cyan-600" : "text-gray-700"}`}
              style={{
                fontFamily: "Rubik",
                fontWeight: 500,
                fontSize: "18px",
                lineHeight: "20px",
                letterSpacing: "0px",
                verticalAlign: "middle",
              }}
            >
              <User className="w-4 h-4" />
              {g === "Male" ? "Men" : g === "Female" ? "Women" : "Random"}
            </span>
          ))}
        </div>

        {/* Filter button */}
        <div className="ml-auto">
          <button
            onClick={() => setShow(true)}
            className="flex items-center justify-center gap-2 text-white px-5 py-2 rounded-full hover:bg-cyan-500 text-sm font-medium shadow"
            style={{
              width: "150px",
              height: "50px",
              borderRadius: "100px",
              opacity: 1,
              background: "linear-gradient(87.11deg, #00D4FF 17.38%, #00A3E0 95.19%)",
            }}
          >
            <img src={Filter} alt="Filter" className="w-6 h-6" />
            <span
              style={{
                fontFamily: "Rubik,sans-serif",
                fontWeight: 400,
                fontSize: "20px",
                lineHeight: "20px",
                letterSpacing: "0px",
                verticalAlign: "middle",
              }}
            >
              Filter
            </span>
          </button>
        </div>
      </div>



      {/* ─── Sliding Panel ──────────────────────────────────────────────── */}
      <div
        className={`
          fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white shadow-lg
          transform transition-transform duration-300
          ${show ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div
          className="
            p-6 h-full flex flex-col overflow-y-auto
            [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
          "
        >
          {/* Header */}
          <div className="flex justify-end mb-4">
            <X
              className="w-5 h-5 cursor-pointer hover:text-red-500"
              onClick={() => setShow(false)}
            />
          </div>

          {/* Reset all */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Filter & Show
            </h2>
            <div>

              <button
                className="text-sm text-red-500 underline"
                onClick={() => resetFilters()}
              >
                Reset all
              </button>
            </div>
          </div>

          {/* Distance range */}
          <div className="mb-6">
            <p className="text-sm text-pink-500 font-medium mb-1">
              Distance range
            </p>
            <input
              type="range"
              min="0"
              max="500"
              value={distanceRange}
              onChange={(e) => setDistanceRange(e.target.value)}
              className="w-full accent-cyan-400"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0.00 km</span>
              <span>500.00 km</span>
            </div>
          </div>

          {/* Age dual‐handle slider */}
          <div className="mb-6">
            <p className="text-sm text-pink-500 font-medium mb-1">Age</p>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{ageMin}</span>
              <span>{ageMax}</span>
            </div>
            <div className="relative h-2">
              <div className="absolute inset-0 bg-gray-300 rounded-full" />
              <div
                className="absolute h-2 bg-cyan-400 rounded-full"
                style={{
                  left: `${pct(ageMin)}%`,
                  width: `${pct(ageMax) - pct(ageMin)}%`,
                }}
              />
              <input
                type="range"
                min={MIN_AGE}
                max={MAX_AGE}
                value={ageMin}
                onChange={(e) => {
                  const v = Math.min(Number(e.target.value), ageMax - 1);
                  setAgeMin(v);
                }}
                className="
                  absolute w-full h-2 appearance-none bg-transparent
                  pointer-events-none
                  [&::-webkit-slider-thumb]:pointer-events-auto
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-white
                  [&::-webkit-slider-thumb]:border-2
                  [&::-webkit-slider-thumb]:border-cyan-400
                  [&::-webkit-slider-thumb]:-mt-1
                "
              />
              <input
                type="range"
                min={MIN_AGE}
                max={MAX_AGE}
                value={ageMax}
                onChange={(e) => {
                  const v = Math.max(Number(e.target.value), ageMin + 1);
                  setAgeMax(v);
                }}
                className="
                  absolute w-full h-2 appearance-none bg-transparent
                  pointer-events-none
                  [&::-webkit-slider-thumb]:pointer-events-auto
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-white
                  [&::-webkit-slider-thumb]:border-2
                  [&::-webkit-slider-thumb]:border-cyan-400
                  [&::-webkit-slider-thumb]:-mt-1
                "
              />
            </div>
          </div>

          {/* Search Preferences */}
          <FilterSection
            label="Search Preferences"
            options={["Male", "Female", "Random"]}
            selected={gender ? [gender] : []}
            onToggle={(v) => setGender(v === "Random" ? "" : v)}
          />

          {/* Interests */}
          <FilterSection
            label="Interests"
            options={[
              "Travel",
              "Cooking",
              "Hiking",
              "Yoga",
              "Gaming",
              "Movies",
              "Books",
              "Animals",
              "Wine",
              "Comedy",
              "Football",
              "Meditation",
              "Pet allowed",
            ]}
            selected={interests}
            onToggle={toggleInterest}
          />

          {/* Languages I Know */}
          <FilterSection
            label="Languages I Know"
            options={[
              "English",
              "Gujarati",
              "Hindi",
              "Bengali",
              "Portuguese",
              "Russian",
              "Japanese",
              "Turkish",
              "French",
              "Korean",
              "German",
              "Vietnamese",
            ]}
            selected={languages}
            onToggle={toggleLanguage}
          />

          {/* Religion */}
          <FilterSection
            label="Religion"
            options={[
              "Casual",
              "Friendship",
              "Dating",
              "Buddhism",
              "Judaism",
              "Sikhism",
              "Taoism",
              "Jainism",
              "Shintoism",
              "Bahá'í Faith",
              "Zoroastrianism",
            ]}
            selected={religions}
            onToggle={toggleReligion}
          />

          {/* Relationship Goals */}
          <FilterSection
            label="Relationship Goals"
            options={["Love Commitment", "Casual Fun"]}
            selected={
              matchIntent
                ? [
                  matchIntent === "LoveCommitment"
                    ? "Love Commitment"
                    : "Casual Fun",
                ]
                : []
            }
            onToggle={(val) =>
              setMatchIntent(
                matchIntent === val?.split(" ")?.join("")
                  ? ""
                  : val?.split(" ")?.join("")
              )
            }
          />

          {/* Verify Profile */}
          {/* <FilterSection
            label="Verify Profile"
            options={["Unverify", "Verify"]}
            selected={isVerified == null ? [] : [String(isVerified)]}
            onToggle={(v) => setIsVerified(v === "Verify")}
          /> */}
          <FilterSection
            label="Verify Profile"
            options={["Unverify", "Verify"]}
            selected={
              isVerified === true ? ["Verify"] :
                isVerified === false ? ["Unverify"] :
                  []
            }
            onToggle={(val) =>
              setIsVerified(
                isVerified === (val === "Verify")
                  ? null // unselect if already selected
                  : val === "Verify"
              )
            }
          />

          {/* Footer */}
          <div className="flex justify-between mt-auto pt-4 border-t border-gray-200">
            <button
              className="
                w-1/2 mr-2 px-4 py-2
                bg-gradient-to-r from-[#00A3E0] to-[#00D4FF]
                text-white rounded-full hover:opacity-90 transition
              "
              onClick={resetFilters}
            >
              Reset
            </button>
            <button
              className="
                w-1/2 ml-2 px-4 py-2
                bg-gradient-to-r from-[#FFC5C5] to-[#FF9999]
                text-white rounded-full hover:opacity-90 transition
              "
              onClick={applyFilters}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
