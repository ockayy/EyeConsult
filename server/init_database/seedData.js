// init_database/seedData.js
const pool = require("../database"); // Adjust the path if necessary
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

const seedData = async () => {
  // ------------------------------
  // INSERT 5 STORE OWNERS
  // ------------------------------
  const insertStoreOwners = async () => {
    try {
      const storeOwners = [
        {
          fname: "Alice",
          lname: "Brown",
          gender: "Female",
          email: "alice.brown@store.com",
          phoneno: "555-123-4567",
          cnic: "11111-2222222-3",
          password: "storeowner1",
          address: "123 Maple Street",
          type: "store_owner",
          site: "store",
        },
        {
          fname: "Bob",
          lname: "Smith",
          gender: "Male",
          email: "bob.smith@store.com",
          phoneno: "555-234-5678",
          cnic: "22222-3333333-4",
          password: "storeowner2",
          address: "456 Oak Avenue",
          type: "store_owner",
          site: "store",
        },
        {
          fname: "Carol",
          lname: "Johnson",
          gender: "Female",
          email: "carol.johnson@store.com",
          phoneno: "555-345-6789",
          cnic: "33333-4444444-5",
          password: "storeowner3",
          address: "789 Pine Road",
          type: "store_owner",
          site: "store",
        },
        {
          fname: "David",
          lname: "Lee",
          gender: "Male",
          email: "david.lee@store.com",
          phoneno: "555-456-7890",
          cnic: "44444-5555555-6",
          password: "storeowner4",
          address: "321 Birch Boulevard",
          type: "store_owner",
          site: "store",
        },
        {
          fname: "Eva",
          lname: "Martinez",
          gender: "Female",
          email: "eva.martinez@store.com",
          phoneno: "555-567-8901",
          cnic: "55555-6666666-7",
          password: "storeowner5",
          address: "654 Cedar Lane",
          type: "store_owner",
          site: "store",
        },
      ];

      for (const owner of storeOwners) {
        // Hash the store owner's password
        const hashedPassword = await bcrypt.hash(owner.password, 10);

        // Insert store owner into the store_owners table
        await pool.query(
          `INSERT INTO store_owners 
            (fname, lname, gender, email, phoneno, cnic, password, address, type, site)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (email) DO NOTHING`,
          [
            owner.fname,
            owner.lname,
            owner.gender,
            owner.email,
            owner.phoneno,
            owner.cnic,
            hashedPassword,
            owner.address,
            owner.type,
            owner.site,
          ]
        );
      }

      console.log("5 sample store owners inserted.");
    } catch (error) {
      console.error("Error inserting sample store owners:", error);
      throw error;
    }
  };

  // ------------------------------
  // INSERT MEDICINES WITH IMAGES
  // ------------------------------
  const insertMedicines = async () => {
    try {
      // Retrieve store owners' owner_ids
      const storeOwnersResult = await pool.query(
        `SELECT owner_id FROM store_owners WHERE type = 'store_owner'`
      );
      const storeOwnerIds = storeOwnersResult.rows.map((row) => row.owner_id);

      if (storeOwnerIds.length < 5) {
        throw new Error("Not enough store owners to assign medicines.");
      }

      const medicines = [
        {
          name: "Paracetamol",
          description: "Used to treat pain and fever.",
          price: 599,
          stock: 100,
          category: "Pain Relief",
          imagePath: "medicines/paracetamol.jpg",
          sold_by: storeOwnerIds[0],
        },
        {
          name: "Ibuprofen",
          description: "Nonsteroidal anti-inflammatory drug (NSAID).",
          price: 799,
          stock: 150,
          category: "Pain Relief",
          imagePath: "medicines/ibuprofen.jpg",
          sold_by: storeOwnerIds[1],
        },
        {
          name: "Cetirizine",
          description: "Antihistamine used to relieve allergy symptoms.",
          price: 499,
          stock: 200,
          category: "Allergy",
          imagePath: "medicines/cetirizine.jpg",
          sold_by: storeOwnerIds[2],
        },
        {
          name: "Amoxicillin",
          description: "Antibiotic used to treat bacterial infections.",
          price: 1299,
          stock: 80,
          category: "Antibiotic",
          imagePath: "medicines/amoxicillin.jpg",
          sold_by: storeOwnerIds[3],
        },
        {
          name: "Aspirin",
          description: "Used to reduce pain, fever, or inflammation.",
          price: 649,
          stock: 120,
          category: "Pain Relief",
          imagePath: "medicines/aspirin.jpg",
          sold_by: storeOwnerIds[4],
        },
        {
          name: "Loratadine",
          description: "Antihistamine used for allergy relief.",
          price: 549,
          stock: 180,
          category: "Allergy",
          imagePath: "medicines/loratadine.jpg",
          sold_by: storeOwnerIds[0],
        },
        {
          name: "Metformin",
          description: "Used to treat type 2 diabetes.",
          price: 999,
          stock: 90,
          category: "Diabetes",
          imagePath: "medicines/metformin.jpg",
          sold_by: storeOwnerIds[1],
        },
        {
          name: "Omeprazole",
          description: "Proton pump inhibitor used to treat acid reflux.",
          price: 899,
          stock: 110,
          category: "Gastrointestinal",
          imagePath: "medicines/omeprazole.jpg",
          sold_by: storeOwnerIds[2],
        },
        {
          name: "Simvastatin",
          description: "Used to control hypercholesterolemia.",
          price: 1099,
          stock: 130,
          category: "Cholesterol",
          imagePath: "medicines/simvastatin.jpg",
          sold_by: storeOwnerIds[3],
        },
        {
          name: "Azithromycin",
          description: "Antibiotic used for various infections.",
          price: 1499,
          stock: 70,
          category: "Antibiotic",
          imagePath: "medicines/azithromycin.jpg",
          sold_by: storeOwnerIds[4],
        },
      ];

      for (const med of medicines) {
        let imageData = null;
        let imageType = null;

        const fullImagePath = path.join(__dirname, "images", med.imagePath);

        if (fs.existsSync(fullImagePath)) {
          imageData = fs.readFileSync(fullImagePath);
          imageType = path.extname(fullImagePath).substring(1); // e.g., 'jpg'
        } else {
          console.warn(
            `Image for ${med.name} not found at ${fullImagePath}. Skipping image.`
          );
        }

        await pool.query(
          `INSERT INTO medicines (name, description, price, stock, category, image, image_type, sold_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (name) DO NOTHING`,
          [
            med.name,
            med.description,
            med.price,
            med.stock,
            med.category,
            imageData,
            imageType,
            med.sold_by,
          ]
        );
      }

      console.log("10 sample medicines inserted with 'sold_by' assignments.");
    } catch (error) {
      console.error("Error inserting sample medicines:", error);
      throw error;
    }
  };

  // ------------------------------
  // INSERT 5 DOCTORS (with profile images)
  // ------------------------------
  const insertDoctors = async () => {
    try {
      // Updated doctors list now loads a profile picture from images/doctors/
      const doctors = [
        {
          name: "Dr. Ayesha Khan",
          phoneno: "123-456-7890",
          cnic: "12345-6789012-3",
          dob: "1980-05-15",
          email: "ayesha.khan@example.com",
          password: "doctor1",
          experience_years: 10,
          experience_title: "Senior Ophthalmologist",
          education: "MBBS, FCPS Ophthalmology",
          current_hospital: "Pakistan Eye Hospital",
          fee: 150.0,
          description: "Expert in cataract and refractive surgeries.",
          available_start_time: "09:00",
          available_end_time: "17:00",
          specialization: ["Ophthalmology"],
          services: ["Eye Consultation", "Cataract Surgery", "LASIK"],
          type: "doctor",
          site: "main",
        },
        {
          name: "Dr. Hassan Raza",
          phoneno: "234-567-8901",
          cnic: "23456-7890123-4",
          dob: "1975-08-22",
          email: "hassan.raza@example.com",
          password: "doctor2",
          experience_years: 15,
          experience_title: "Consultant Ophthalmologist",
          education: "MBBS, FRCS Ophthalmology",
          current_hospital: "Shifa Eye Center",
          fee: 130.0,
          description: "Specialist in retinal disorders and treatments.",
          available_start_time: "10:00",
          available_end_time: "18:00",
          specialization: ["Ophthalmology"],
          services: ["Retinal Checkup", "Diabetic Eye Treatment"],
          type: "doctor",
          site: "main",
        },
        {
          name: "Dr. Fatima Ahmed",
          phoneno: "345-678-9012",
          cnic: "34567-8901234-5",
          dob: "1985-11-30",
          email: "fatima.ahmed@example.com",
          password: "doctor3",
          experience_years: 8,
          experience_title: "Pediatric Ophthalmologist",
          education: "MBBS, DNB Pediatric Ophthalmology",
          current_hospital: "Children's Eye Care Clinic",
          fee: 100.0,
          description: "Expert in treating eye conditions in children.",
          available_start_time: "08:00",
          available_end_time: "16:00",
          specialization: ["Ophthalmology"],
          services: ["Vision Therapy", "Squint Correction"],
          type: "doctor",
          site: "main",
        },
        {
          name: "Dr. Usman Ali",
          phoneno: "456-789-0123",
          cnic: "45678-9012345-6",
          dob: "1970-02-10",
          email: "usman.ali@example.com",
          password: "doctor4",
          experience_years: 20,
          experience_title: "Neuro-Ophthalmologist",
          education: "MBBS, MD Neuro-Ophthalmology",
          current_hospital: "Neuro Vision Clinic",
          fee: 200.0,
          description: "Expert in vision-related neurological disorders.",
          available_start_time: "11:00",
          available_end_time: "19:00",
          specialization: ["Ophthalmology"],
          services: ["Optic Nerve Evaluation", "Double Vision Treatment"],
          type: "doctor",
          site: "main",
        },
        {
          name: "Dr. Zara Malik",
          phoneno: "567-890-1234",
          cnic: "56789-0123456-7",
          dob: "1990-07-25",
          email: "zara.malik@example.com",
          password: "doctor5",
          experience_years: 5,
          experience_title: "Cornea Specialist",
          education: "MBBS, FCPS Cornea",
          current_hospital: "Cornea Care Center",
          fee: 90.0,
          description: "Specializes in corneal diseases and transplants.",
          available_start_time: "07:00",
          available_end_time: "15:00",
          specialization: ["Ophthalmology"],
          services: ["Corneal Transplant", "Keratoconus Treatment"],
          type: "doctor",
          site: "main",
        },
      ];

      // Use a standard loop to also get the index for selecting the corresponding image
      for (let i = 0; i < doctors.length; i++) {
        const doc = doctors[i];
        // Hash the doctor's password
        const hashedPassword = await bcrypt.hash(doc.password, 10);
        let profilePicData = null;
        let profilePicType = null;
        // Assume each doctor's profile image is stored in images/doctors/ as doctor1.jpg, doctor2.jpg, etc.
        const doctorImgPath = path.join(
          __dirname,
          "images",
          "doctors",
          `doctor${i + 1}.jpg`
        );
        if (fs.existsSync(doctorImgPath)) {
          profilePicData = fs.readFileSync(doctorImgPath);
          profilePicType = path.extname(doctorImgPath).substring(1);
        } else {
          console.warn(
            `Doctor image not found at ${doctorImgPath}. Skipping image.`
          );
        }

        await pool.query(
          `INSERT INTO doctors 
            (name, phoneno, cnic, dob, email, password, experience_years, experience_title, education, current_hospital, fee, description, available_start_time, available_end_time, specialization, services, profile_pic, profile_pic_type, type, site)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
           ON CONFLICT (email) DO NOTHING`,
          [
            doc.name,
            doc.phoneno,
            doc.cnic,
            doc.dob,
            doc.email,
            hashedPassword,
            doc.experience_years,
            doc.experience_title,
            doc.education,
            doc.current_hospital,
            doc.fee,
            doc.description,
            doc.available_start_time,
            doc.available_end_time,
            doc.specialization,
            doc.services,
            profilePicData,
            profilePicType,
            doc.type,
            doc.site,
          ]
        );
      }

      console.log("5 sample doctors inserted.");
    } catch (error) {
      console.error("Error inserting sample doctors:", error);
      throw error;
    }
  };

  // ------------------------------
  // INSERT 5 PATIENTS (with profile images)
  // ------------------------------
  const insertPatients = async () => {
    try {
      const patients = [
        {
          fname: "Alice",
          lname: "Johnson",
          gender: "Female",
          email: "alice.johnson@example.com",
          phoneno: "678-901-2345",
          cnic: "67890-1234567-8",
          password: "patient1",
          address: "456 Elm St",
          description: "Regular check-ups",
          type: "patient",
          site: "main",
        },
        {
          fname: "Bob",
          lname: "Smith",
          gender: "Male",
          email: "bob.smith@example.com",
          phoneno: "789-012-3456",
          cnic: "78901-2345678-9",
          password: "patient2",
          address: "789 Pine St",
          description: "Requires allergy treatment",
          type: "patient",
          site: "main",
        },
        {
          fname: "Carol",
          lname: "Davis",
          gender: "Female",
          email: "carol.davis@example.com",
          phoneno: "890-123-4567",
          cnic: "89012-3456789-0",
          password: "patient3",
          address: "321 Oak St",
          description: "Diabetic patient",
          type: "patient",
          site: "main",
        },
        {
          fname: "David",
          lname: "Miller",
          gender: "Male",
          email: "david.miller@example.com",
          phoneno: "901-234-5678",
          cnic: "90123-4567890-1",
          password: "patient4",
          address: "654 Maple St",
          description: "Needs regular consultations",
          type: "patient",
          site: "main",
        },
        {
          fname: "Eva",
          lname: "Garcia",
          gender: "Female",
          email: "eva.garcia@example.com",
          phoneno: "012-345-6789",
          cnic: "01234-5678901-2",
          password: "patient5",
          address: "987 Birch St",
          description: "Requires dermatology services",
          type: "patient",
          site: "main",
        },
      ];

      // Use a standard loop to access the index for selecting an image (patient1.jpg, patient2.jpg, etc.)
      for (let i = 0; i < patients.length; i++) {
        const pat = patients[i];
        const hashedPassword = await bcrypt.hash(pat.password, 10);
        let profilePicData = null;
        let profilePicType = null;
        const patientImgPath = path.join(
          __dirname,
          "images",
          "patients",
          `patient${i + 1}.jpg`
        );
        if (fs.existsSync(patientImgPath)) {
          profilePicData = fs.readFileSync(patientImgPath);
          profilePicType = path.extname(patientImgPath).substring(1);
        } else {
          console.warn(
            `Patient image not found at ${patientImgPath}. Skipping image.`
          );
        }

        await pool.query(
          `INSERT INTO patient 
            (fname, lname, gender, email, phoneno, cnic, password, address, description, profile_pic, profile_pic_type, type, site)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           ON CONFLICT (email) DO NOTHING`,
          [
            pat.fname,
            pat.lname,
            pat.gender,
            pat.email,
            pat.phoneno,
            pat.cnic,
            hashedPassword,
            pat.address,
            pat.description,
            profilePicData,
            profilePicType,
            pat.type,
            pat.site,
          ]
        );
      }

      console.log("5 sample patients inserted.");
    } catch (error) {
      console.error("Error inserting sample patients:", error);
      throw error;
    }
  };

  // ------------------------------
  // INSERT 2 STORE USERS
  // ------------------------------
  const insertStoreUsers = async () => {
    try {
      const storeUsers = [
        {
          fname: "John",
          lname: "Doe",
          gender: "Male",
          email: "john.doe@example.com",
          phoneno: "123-456-7890",
          cnic: "12345-6789012-3",
          password: "user1",
          address: "123 Main St",
          type: "store_user",
          site: "store",
        },
        {
          fname: "Jane",
          lname: "Smith",
          gender: "Female",
          email: "jane.smith@example.com",
          phoneno: "234-567-8901",
          cnic: "23456-7890123-4",
          password: "user2",
          address: "456 Oak St",
          type: "store_user",
          site: "store",
        },
      ];

      for (const user of storeUsers) {
        const hashedPassword = await bcrypt.hash(user.password, 10);

        await pool.query(
          `INSERT INTO store_users 
            (fname, lname, gender, email, phoneno, cnic, password, address, type, site)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (email) DO NOTHING`,
          [
            user.fname,
            user.lname,
            user.gender,
            user.email,
            user.phoneno,
            user.cnic,
            hashedPassword,
            user.address,
            user.type,
            user.site,
          ]
        );
      }

      console.log("2 sample store users inserted.");
    } catch (error) {
      console.error("Error inserting sample store users:", error);
      throw error;
    }
  };

  // ------------------------------
  // INSERT SAMPLE ORDERS
  // ------------------------------
  const insertSampleOrders = async () => {
    try {
      // Get the user_id of the sample store users
      const userResult = await pool.query(
        `SELECT user_id FROM store_users WHERE email IN ($1, $2)`,
        ["john.doe@example.com", "jane.smith@example.com"]
      );

      if (userResult.rows.length === 0) {
        throw new Error("Sample store users not found.");
      }

      const userIds = userResult.rows.map((row) => row.user_id);

      // Create sample orders for each user
      for (const userId of userIds) {
        // Create a sample order
        const orderResult = await pool.query(
          `INSERT INTO orders (user_id, total_price, status, address)
           VALUES ($1, $2, $3, $4) RETURNING order_id`,
          [userId, 50.0, "Pending", "123 Main St"]
        );
        const orderId = orderResult.rows[0].order_id;

        // Add order items (Assuming medicine_id 1 exists)
        await pool.query(
          `INSERT INTO order_items (order_id, medicine_id, quantity, price)
           VALUES ($1, $2, $3, $4)`,
          [orderId, 1, 2, 25.0]
        );
      }

      console.log("Sample orders inserted.");
    } catch (error) {
      console.error("Error inserting sample orders:", error);
      throw error;
    }
  };

  // ------------------------------
  // INSERT 5 BLOGS (eye care-related) with images
  // ------------------------------
  const insertBlogs = async () => {
    try {
      
      const blogs = [
        {
          blog_id: 1,
          blog_image: "blog/CNV.jpg",
          blog_title: "Understanding CNV (Choroidal Neovascularization)",
          blog_description: `Understanding CNV (Choroidal Neovascularization)
      
      Choroidal Neovascularization (CNV) is a serious eye condition that affects the retina leading to vision loss if left untreated.
      
      1. **What is CNV?**
         - CNV occurs when abnormal blood vessels grow beneath the retina and the macula.
         - These vessels can leak fluid and blood causing scarring and damage to the retina.
      
      2. **Causes**
         - Age-related macular degeneration (AMD)
         - Pathological myopia (severe nearsightedness)
         - Ocular trauma
         - Inflammatory diseases of the eye
      
      3. **Symptoms**
         - Distorted vision (metamorphopsia)
         - Blurred vision
         - Dark spots in central vision
         - Sudden vision loss
      
      4. **Treatment Options**
         - Anti-VEGF Injections to inhibit abnormal blood vessel growth
         - Laser Therapy to seal leaking blood vessels
         - Photodynamic Therapy combining light-sensitive drug with laser
      
      Regular eye exams are essential for early detection of CNV. If you experience any symptoms consult an eye care professional promptly to prevent severe vision loss.`,
          published_at: "2024-07-01",
          doctor_id: 1,
        },
        {
          blog_id: 2,
          blog_image: "blog/drusen.jpg",
          blog_title: "What are Drusen and How Do They Affect Vision?",
          blog_description: `What are Drusen and How Do They Affect Vision?
      
      Drusen are tiny yellow or white deposits that form under the retina often associated with aging and age-related macular degeneration (AMD).
      
      1. **What are Drusen?**
         - Accumulations of extracellular material under the retina
         - Build up between Bruch's membrane and retinal pigment epithelium
      
      2. **Types of Drusen**
         - Hard drusen: Small, distinct and less likely to cause vision problems
         - Soft drusen: Larger, less distinct with higher AMD risk
      
      3. **Impact on Vision**
         - Small drusen usually do not affect vision
         - Large drusen can lead to central vision loss
         - Associated with increased risk of AMD
      
      4. **Detection and Monitoring**
         - Regular eye exams are crucial
         - Retinal imaging helps track progression
         - Early detection enables better management
      
      Maintaining a healthy lifestyle including a balanced diet and avoiding smoking can help reduce the risk of developing drusen-related eye conditions.`,
          published_at: "2024-07-02",
          doctor_id: 1,
        },
        {
          blog_id: 3,
          blog_image: "blog/DME.jpg",
          blog_title: "Diabetic Macular Edema (DME) - Symptoms and Treatment",
          blog_description: `Diabetic Macular Edema (DME) - Symptoms and Treatment
      
      Diabetic Macular Edema (DME) is a complication of diabetes that affects the macula leading to vision impairment.
      
      1. **What is DME?**
         - Occurs when high blood sugar damages blood vessels in the retina
         - Causes fluid leakage into the macula
         - Results in blurred and distorted vision
      
      2. **Symptoms**
         - Blurry or wavy central vision
         - Colors appearing washed out
         - Difficulty reading or seeing details
      
      3. **Risk Factors**
         - Poor blood sugar control
         - Long duration of diabetes
         - High blood pressure
         - High cholesterol levels
      
      4. **Treatment Options**
         - Anti-VEGF Injections for reducing fluid leakage
         - Corticosteroid injections to reduce inflammation
         - Laser Photocoagulation to seal leaking vessels
      
      Managing diabetes through proper diet, exercise and medication is crucial in preventing DME. Regular eye exams can help detect early signs of DME.`,
          published_at: "2024-07-03",
          doctor_id: 3,
        },
        {
          blog_id: 4,
          blog_image: "blog/maintain.jpg",
          blog_title: "How to Maintain Healthy Vision",
          blog_description: `How to Maintain Healthy Vision
      
      Maintaining healthy vision is essential for overall well-being. Learn these key practices for protecting your eyes.
      
      1. **Regular Check-ups**
         - Schedule annual comprehensive eye exams
         - Get early detection of potential issues
         - Update prescriptions as needed
      
      2. **Healthy Diet**
         - Consume foods rich in vitamins A, C, and E
         - Include omega-3 fatty acids in your diet
         - Eat plenty of leafy greens and fish
      
      3. **Eye Protection**
         - Wear UV-protective sunglasses outdoors
         - Use safety glasses during hazardous activities
         - Take regular breaks from screen time
      
      4. **Digital Eye Care**
         - Follow the 20-20-20 rule
         - Maintain proper screen distance
         - Adjust screen brightness and contrast
      
      5. **Lifestyle Choices**
         - Stay well-hydrated
         - Avoid smoking
         - Maintain healthy blood pressure
         - Control diabetes if applicable
      
      Incorporating these habits into your daily routine will help maintain your eye health for years to come.`,
          published_at: "2024-07-04",
          doctor_id: 3,
        },
        {
          blog_id: 5,
          blog_image: "blog/importance.jpg",
          blog_title: "The Importance of Regular Eye Exams",
          blog_description: `The Importance of Regular Eye Exams
      
      Regular eye exams are vital for maintaining good vision and detecting eye conditions early.
      
      1. **Why Regular Exams Matter**
         - Early detection of eye conditions
         - Prevention of vision loss
         - Monitoring of existing conditions
         - Updates to vision prescriptions
      
      2. **What to Expect**
         - Visual acuity testing
         - Refraction assessment
         - Eye pressure measurement
         - Retinal examination
      
      3. **Frequency Guidelines**
         - Adults: Every 2 years if healthy
         - Over 60: Annually
         - Diabetes: Annually or as advised
         - Family history: As recommended
      
      4. **Warning Signs**
         - Blurred or double vision
         - Eye pain or redness
         - Flashes or floaters
         - Changes in vision
      
      Schedule your eye exam regularly to maintain healthy vision and catch potential problems early.`,
          published_at: "2024-07-05",
          doctor_id: 1,
        },
      ];

      for (const blog of blogs) {
        let blogImageData = null;
        let blogImageType = null;

        const fullImagePath = path.join(__dirname, "images", blog.blog_image);
        if (fs.existsSync(fullImagePath)) {
          blogImageData = fs.readFileSync(fullImagePath);
          blogImageType = path.extname(fullImagePath).substring(1);
        } else {
          console.warn(
            `Image for blog "${blog.blog_title}" not found at ${fullImagePath}. Skipping image.`
          );
        }

        await pool.query(
          `INSERT INTO blogs (blog_id, blog_title, blog_description, published_at, doctor_id, blog_image, blog_image_type)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (blog_id) DO NOTHING`,
          [
            blog.blog_id,
            blog.blog_title,
            blog.blog_description,
            blog.published_at,
            blog.doctor_id,
            blogImageData,
            blogImageType,
          ]
        );
      }

      console.log("5 sample blogs inserted.");
    } catch (error) {
      console.error("Error inserting sample blogs:", error);
      throw error;
    }
  };

  // ------------------------------
  // INSERT 7 EXERCISES WITH IMAGES
  // ------------------------------
  const insertExercises = async () => {
    try {
      const exercises = [
        {
          ex_id: 1,
          ex_pic: "exercise/rule.jpg",
          ex_title: "The 20-20-20 rule",
          ex_description: `### The 20-20-20 Rule for Easing Digital Eye Strain

The 20-20-20 rule helps ease digital eye strain. The rule is easy:

1. A person needs to look at something 20 feet away for 20 seconds every 20 minutes while working on a computer.
`,
        },
        {
          ex_id: 2,
          ex_pic: "exercise/focus.jpg",
          ex_title: "Focus change",
          ex_description: `### Focus Change Exercise for Digital Eye Strain

Perform this exercise while sitting comfortably.

1. **Hold Finger Near Eye**
   - Hold one finger a few inches away from one eye.

2. **Focus on the Finger**
   - Focus your gaze on the finger.

3. **Move Finger Away**
   - Slowly move the finger away from your face.

4. **Switch Focus to Distant Object**
   - Focus on an object farther away.

5. **Refocus on Finger**
   - Switch your focus back to the finger.

6. **Bring Finger Closer**
   - Bring the finger back closer to your eye.

7. **Switch Focus Again**
   - Focus on an object farther away once more.

8. **Repeat**
   - Repeat three times.
`,
        },
        {
          ex_id: 3,
          ex_pic: "exercise/Figure.jpg",
          ex_title: "Figure 8",
          ex_description: `### Figure 8 Exercise for Digital Eye Strain

1. **Focus on a Distant Area**
   - Focus on an area on the floor around 8 feet away.

2. **Move Eyes in Figure 8**
   - Slowly move your eyes in the shape of a figure 8.

3. **Trace the Imaginary Figure 8**
   - Trace the imaginary figure 8 for 30 seconds, then switch direction.
`,
        },
        {
          ex_id: 4,
          ex_pic: "exercise/Pencil.jpg",
          ex_title: "Pencil pushups",
          ex_description: `### Pencil Pushups for Convergence Insufficiency

A doctor might recommend this exercise as part of vision therapy.

1. **Hold a Pencil**
   - Hold a pencil at arm’s length, situated between the eyes.

2. **Focus on the Pencil**
   - Look at the pencil and try to keep a single image of it while slowly moving it toward the nose.

3. **Move the Pencil Toward the Nose**
   - Move the pencil toward the nose until the pencil is no longer a single image.

4. **Find the Closest Point**
   - Position the pencil at the closest point where it is still a single image.

5. **Repeat**
   - Repeat 20 times.
`,
        },
        {
          ex_id: 5,
          ex_pic: "exercise/brock.jpg",
          ex_title: "Brock string",
          ex_description: `### Brock String Exercise for Improving Eye Coordination

To complete this exercise, a person will need a long string and some colored beads. They can complete this exercise either sitting or standing.

1. **Secure the String**
   - Secure one end of the string to a motionless object, or another person can hold it.

2. **Hold the String**
   - Hold the other end of the string just below the nose.

3. **Place a Bead**
   - Place one bead on the string.

4. **Focus on the Bead**
   - Look straight at the bead with both eyes open.

If the eyes are working correctly, a person should see the bead and two strings in the shape of an X.

If one eye is closed, one of the strings will disappear, which means that the eye is suppressing. If the person sees two beads and two strings, the eyes are not converged at the bead.
`,
        },
        {
          ex_id: 6,
          ex_pic: "exercise/Barrel.jpg",
          ex_title: "Barrel cards",
          ex_description: `### Barrel Cards Exercise for Exotropia

Barrel cards is a good exercise for exotropia, which is a type of strabismus.

1. **Draw Red Barrels**
   - Draw three red barrels of increasing sizes on one side of a card.

2. **Draw Green Barrels**
   - Repeat in green on the other side of the card.

3. **Position the Card**
   - Hold the card against the nose so that the largest barrel is farthest away.

4. **Stare at the Far Barrel**
   - Stare at the far barrel until it becomes one image with both colors and the other two images have doubled.

5. **Maintain Gaze**
   - Maintain the gaze for about 5 seconds.

6. **Repeat for Other Barrels**
   - Repeat the exercise with the middle and smallest images.
`,
        },
        {
          ex_id: 7,
          ex_pic: "exercise/eye.jpg",
          ex_title: "Eye movements",
          ex_description: `### Eye Movement Exercise for Digital Eye Strain

Perform this exercise to help with digital eye strain.

1. **Move Eyes Upward and Downward**
   - Slowly move your eyes upward, then downward.

2. **Close Eyes**
   - Close your eyes.

3. **Move Eyes Upward and Downward Again**
   - Slowly move your eyes upward, then downward.
   - Repeat three times.

4. **Move Eyes in All Directions**
   - Slowly move your eyes to the left, then to the right, then up, then down.

5. **Close Eyes Again**
   - Close your eyes.

6. **Rotate Eyes in a Circle**
   - Slowly rotate your eyes from left, then up, then right, then down.
   - Repeat three times.
`,
        },
      ];

      for (const ex of exercises) {
        let exImageData = null;
        const fullImagePath = path.join(__dirname, "images", ex.ex_pic);
        if (fs.existsSync(fullImagePath)) {
          exImageData = fs.readFileSync(fullImagePath);
        } else {
          console.warn(
            `Image for exercise "${ex.ex_title}" not found at ${fullImagePath}. Skipping image.`
          );
        }

        await pool.query(
          `INSERT INTO exercise (ex_id, ex_title, ex_description, ex_pic)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (ex_id) DO NOTHING`,
          [ex.ex_id, ex.ex_title, ex.ex_description, exImageData]
        );
      }

      console.log("7 sample exercises inserted.");
    } catch (error) {
      console.error("Error inserting sample exercises:", error);
      throw error;
    }
  };

  // ------------------------------
  // RUN ALL INSERTS
  // ------------------------------
  try {
    await insertStoreOwners();
    await insertMedicines();
    await insertDoctors();
    await insertPatients();
    await insertStoreUsers();
    await insertSampleOrders();
    await insertBlogs();
    await insertExercises();
    console.log("Dummy data seeding complete.");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await pool.end();
    process.exit(0);
  }
};

seedData();
