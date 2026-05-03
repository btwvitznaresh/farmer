import { Service } from '../types/services';

export const servicesData: Service[] = [
  {
    id: 'soil-health-test',
    name: 'Soil Health Test',
    nameLocale: {
      en: 'Soil Health Test',
      hi: 'मिट्टी स्वास्थ्य परीक्षण',
      ta: 'மண் சுகாதார சோதனை',
      te: 'నేల ఆరోగ్య పరీక్ష',
      mr: 'माती आरोग्य चाचणी'
    },
    description: 'Comprehensive analysis of your soil health including NPK and moisture.',
    descLocale: {
      en: 'Comprehensive analysis of your soil health including NPK and moisture.',
      hi: 'एनपीके और नमी सहित आपके मिट्टी के स्वास्थ्य का व्यापक विश्लेषण।',
      ta: 'உங்கள் மண்ணின் ஆரோக்கியத்தை முழுமையாக பகுப்பாய்வு செய்தல்.',
      te: 'మీ నేల ఆరోగ్యం యొక్క సమగ్ర విశ్లేషణ.',
      mr: 'तुमच्या मातीच्या आरोग्याचे सखोल विश्लेषण.'
    },
    category: 'soil',
    icon: '🧪',
    priceMin: 499,
    priceMax: 999,
    duration: '2-3 hrs',
    includes: ['NPK analysis', 'pH level test', 'Moisture content', 'Written report', 'Fertiliser recommendation'],
    urgencyLevels: ['normal', 'urgent']
  },
  {
    id: 'drone-survey',
    name: 'Drone Crop Survey',
    nameLocale: {
      en: 'Drone Crop Survey',
      hi: 'ड्रोन फसल सर्वेक्षण',
      ta: 'ட்ரோன் பயிர் கணக்கெடுப்பு',
      te: 'డ్రోన్ పంట సర్వే',
      mr: 'ड्रोन पीक सर्वेक्षण'
    },
    description: 'Aerial mapping and stress detection across your entire farm using advanced drones.',
    descLocale: {
      en: 'Aerial mapping and stress detection across your entire farm using advanced drones.',
      hi: 'उन्नत ड्रोन का उपयोग करके आपके पूरे खेत में हवाई मानचित्रण और तनाव का पता लगाना।',
      ta: 'மேம்பட்ட ட்ரோன்களைப் பயன்படுத்தி உங்கள் முழு பண்ணை முழுவதும் வான்வழி மேப்பிங்.',
      te: 'అధునాతన డ్రోన్లను ఉపయోగించి మీ మొత్తం వ్యవసాయ క్షేత్రంలో ఏరియల్ మ్యాపింగ్.',
      mr: 'प्रगत ड्रोन वापरून संपूर्ण शेतात हवाई मॅपिंग आणि ताण शोधणे.'
    },
    category: 'drone',
    icon: '🚁',
    priceMin: 1499,
    priceMax: 2999,
    duration: '3-4 hrs',
    includes: ['NDVI aerial map', 'Stress zone report', 'Spray recommendations', 'HD photos', 'PDF report'],
    urgencyLevels: ['normal']
  },
  {
    id: 'pest-disease-scan',
    name: 'Pest & Disease Inspection',
    nameLocale: {
      en: 'Pest & Disease Inspection',
      hi: 'कीट और रोग निरीक्षण',
      ta: 'பூச்சி மற்றும் நோய் ஆய்வு',
      te: 'తెగులు మరియు వ్యాధి తనిఖీ',
      mr: 'कीटक आणि रोग तपासणी'
    },
    description: 'In-person field inspection by an agronomist to identify and treat crop issues.',
    descLocale: {
      en: 'In-person field inspection by an agronomist to identify and treat crop issues.',
      hi: 'फसल की समस्याओं की पहचान और इलाज के लिए एक कृषिविज्ञानी द्वारा व्यक्तिगत रूप से क्षेत्र का निरीक्षण।',
      ta: 'பயிர் பிரச்சினைகளை அடையாளம் காணவும் சிகிச்சையளிக்கவும் உழவியல் நிபுணரால் நேரில் ஆய்வு.',
      te: 'పంట సమస్యలను గుర్తించి చికిత్స చేయడానికి వ్యవసాయ శాస్త్రవేత్తచే స్వయంగా క్షేత్ర తనిఖీ.',
      mr: 'पीक समस्या ओळखून उपचार करण्यासाठी कृषीशास्त्रज्ञाकडून प्रत्यक्ष क्षेत्र तपासणी.'
    },
    category: 'crop',
    icon: '🔍',
    priceMin: 299,
    priceMax: 599,
    duration: '1-2 hrs',
    includes: ['Field inspection', 'Disease identification', 'Treatment plan', 'Spray schedule', 'Follow-up call'],
    urgencyLevels: ['normal', 'urgent']
  },
  {
    id: 'water-quality-test',
    name: 'Water Quality Test',
    nameLocale: {
      en: 'Water Quality Test',
      hi: 'पानी की गुणवत्ता परीक्षण',
      ta: 'நீர் தர சோதனை',
      te: 'నీటి నాణ్యత పరీక్ష',
      mr: 'पाण्याची गुणवत्ता चाचणी'
    },
    description: 'Laboratory testing of your irrigation water for suitability and contamination.',
    descLocale: {
      en: 'Laboratory testing of your irrigation water for suitability and contamination.',
      hi: 'उपयुक्तता और संदूषण के लिए आपके सिंचाई के पानी का प्रयोगशाला परीक्षण।',
      ta: 'பொருத்தம் மற்றும் மாசுபாட்டிற்காக உங்கள் பாசன நீரின் ஆய்வக சோதனை.',
      te: 'అనుకూలత మరియు కలుషితం కోసం మీ సాగునీటి ప్రయోగశాల పరీక్ష.',
      mr: 'योग्यतेसाठी आणि दूषिततेसाठी तुमच्या सिंचनाच्या पाण्याची प्रयोगशाळा चाचणी.'
    },
    category: 'soil',
    icon: '💧',
    priceMin: 399,
    priceMax: 799,
    duration: '2-3 hrs',
    includes: ['pH test', 'TDS measurement', 'Contamination check', 'Irrigation suitability', 'Lab report'],
    urgencyLevels: ['normal']
  },
  {
    id: 'irrigation-planning',
    name: 'Irrigation Planning',
    nameLocale: {
      en: 'Irrigation Planning',
      hi: 'सिंचाई योजना',
      ta: 'நீர்ப்பாசன திட்டமிடல்',
      te: 'నీటిపారుదల ప్రణాళిక',
      mr: 'सिंचन नियोजन'
    },
    description: 'Expert farm survey and layout design for optimal drip or sprinkler irrigation.',
    descLocale: {
      en: 'Expert farm survey and layout design for optimal drip or sprinkler irrigation.',
      hi: 'इष्टतम ड्रिप या स्प्रिंकलर सिंचाई के लिए विशेषज्ञ खेत सर्वेक्षण और लेआउट डिजाइन।',
      ta: 'உகந்த சொட்டு அல்லது தெளிப்பான் நீர்ப்பாசனத்திற்கான நிபுணர் பண்ணை ஆய்வு மற்றும் அமைப்பு வடிவமைப்பு.',
      te: 'సరైన డ్రిప్ లేదా స్ప్రింక్లర్ నీటిపారుదల కోసం నిపుణుల వ్యవసాయ సర్వే మరియు లేఅవుట్ డిజైన్.',
      mr: 'इष्टतम ठिबक किंवा तुषार सिंचनासाठी तज्ञ शेत सर्वेक्षण आणि लेआउट डिझाइन.'
    },
    category: 'infrastructure',
    icon: '🚿',
    priceMin: 799,
    priceMax: 1499,
    duration: '4-5 hrs',
    includes: ['Farm survey', 'Water source analysis', 'Drip/sprinkler recommendation', 'Cost estimate', 'Layout diagram'],
    urgencyLevels: ['normal']
  },
  {
    id: 'yield-prediction',
    name: 'AI Yield Prediction',
    nameLocale: {
      en: 'AI Yield Prediction',
      hi: 'एआई उपज भविष्यवाणी',
      ta: 'AI மகசூல் கணிப்பு',
      te: 'AI దిగుబడి అంచనా',
      mr: 'AI उत्पन्न अंदाज'
    },
    description: 'Data-driven forecasting of harvest volumes based on crop health and weather.',
    descLocale: {
      en: 'Data-driven forecasting of harvest volumes based on crop health and weather.',
      hi: 'फसल के स्वास्थ्य और मौसम के आधार पर फसल की मात्रा का डेटा-संचालित पूर्वानुमान।',
      ta: 'பயிர் ஆரோக்கியம் மற்றும் வானிலை அடிப்படையில் அறுவடை தொகுதிகளின் தரவு உந்துதல் முன்கணிப்பு.',
      te: 'పంట ఆరోగ్యం మరియు వాతావరణం ఆధారంగా పంట పరిమాణాల డేటా-ఆధారిత అంచనా.',
      mr: 'पीक आरोग्य आणि हवामानाच्या आधारावर पीक खंडाचा डेटा-चालित अंदाज.'
    },
    category: 'advisory',
    icon: '📊',
    priceMin: 599,
    priceMax: 999,
    duration: '1-2 days',
    includes: ['Crop data analysis', 'Weather correlation', 'Harvest forecast', 'Market timing advice', 'PDF report'],
    urgencyLevels: ['normal']
  },
  {
    id: 'cold-chain-setup',
    name: 'Cold Chain Setup Advice',
    nameLocale: {
      en: 'Cold Chain Setup Advice',
      hi: 'कोल्ड चेन सेटअप सलाह',
      ta: 'குளிர் சங்கிலி அமைப்பு ஆலோசனை',
      te: 'కోల్డ్ చైన్ సెటప్ సలహా',
      mr: 'कोल्ड चेन सेटअप सल्ला'
    },
    description: 'Professional guidance on setting up post-harvest temperature monitoring to prevent spoilage.',
    descLocale: {
      en: 'Professional guidance on setting up post-harvest temperature monitoring to prevent spoilage.',
      hi: 'खराबी को रोकने के लिए फसल के बाद तापमान निगरानी स्थापित करने पर पेशेवर मार्गदर्शन।',
      ta: 'கெட்டுப்போவதைத் தடுக்க அறுவடைக்குப் பின் வெப்பநிலை கண்காணிப்பை அமைப்பதற்கான தொழில்முறை வழிகாட்டுதல்.',
      te: 'చెడిపోకుండా నిరోధించడానికి పంటకోత తర్వాత ఉష్ణోగ్రత పర్యవేక్షణను ఏర్పాటు చేయడంపై వృత్తిపరమైన మార్గదర్శకత్వం.',
      mr: 'नासाडी टाळण्यासाठी पीक काढणीनंतर तापमान निरीक्षण स्थापित करण्यावर व्यावसायिक मार्गदर्शन.'
    },
    category: 'infrastructure',
    icon: '🌡️',
    priceMin: 999,
    priceMax: 1999,
    duration: '3-4 hrs',
    includes: ['Storage assessment', 'Temperature monitoring setup', 'Spoilage prevention plan', 'Vendor recommendations'],
    urgencyLevels: ['normal', 'urgent']
  },
  {
    id: 'govt-scheme-help',
    name: 'Govt Scheme Assistance',
    nameLocale: {
      en: 'Govt Scheme Assistance',
      hi: 'सरकारी योजना सहायता',
      ta: 'அரசு திட்ட உதவி',
      te: 'ప్రభుత్వ పథకం సహాయం',
      mr: 'सरकारी योजना सहाय्य'
    },
    description: 'Help with eligibility checking, registration, and form filling for agricultural subsidies.',
    descLocale: {
      en: 'Help with eligibility checking, registration, and form filling for agricultural subsidies.',
      hi: 'कृषि सब्सिडी के लिए पात्रता जांच, पंजीकरण और फॉर्म भरने में मदद।',
      ta: 'விவசாய மானியங்களுக்கான தகுதி சரிபார்ப்பு, பதிவு மற்றும் படிவம் நிரப்புதல் ஆகியவற்றில் உதவி.',
      te: 'వ్యవసాయ రాయితీల కోసం అర్హత తనిఖీ, నమోదు మరియు ఫారమ్ నింపడంలో సహాయం.',
      mr: 'कृषी अनुदानासाठी पात्रता तपासणी, नोंदणी आणि फॉर्म भरण्यात मदत.'
    },
    category: 'government',
    icon: '📋',
    priceMin: 199,
    priceMax: 399,
    duration: '1-2 hrs',
    includes: ['Eligibility check', 'PM-KISAN registration', 'PMFBY crop insurance', 'Soil Health Card', 'Form filling assistance'],
    urgencyLevels: ['normal']
  }
];
