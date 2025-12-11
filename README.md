# GPA/CGPA Calculator - Law School Edition

A modern, feature-rich web application for calculating GPA and CGPA with a **customizable grading rubric**. Designed specifically for law school students with support for law and non-law subjects.

![GPA Calculator](https://img.shields.io/badge/GPA-Calculator-8A2BE2)
![License](https://img.shields.io/badge/license-MIT-blue)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ Features

- 🎓 **Customizable Grading Rubric**: Modify grade names and point values to match your institution
- 📊 **Multi-Semester Support**: Add unlimited semesters and track your progress
- 🎯 **Automatic Calculations**: Real-time GPA and CGPA calculations
- 📚 **Subject Type Differentiation**: Separate credit values for law (4 credits) and non-law (3 credits) subjects
- 💾 **Data Persistence**: All your data is saved locally in your browser
- 🎨 **Modern UI**: Beautiful dark mode interface with smooth animations
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- ⚡ **Special Rules**: Automatically excludes English from Semester 1 GPA calculations

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- No installation or server required!

### Usage

1. **Clone or download this repository**
   ```bash
   git clone https://github.com/yourusername/gpa-calculator.git
   cd gpa-calculator
   ```

2. **Open the application**
   - Simply open `index.html` in your web browser
   - Or use a local server:
     ```bash
     # Using Python 3
     python -m http.server 8000
     
     # Using Node.js
     npx serve
     ```

3. **Start calculating!**
   - The default grading rubric is pre-loaded
   - Click "Add Semester" to create your first semester
   - Add subjects with their grades and types
   - Watch your GPA and CGPA update automatically

## 📖 How It Works

### Default Grading Rubric

| Grade | Points |
|-------|--------|
| O     | 10.0   |
| A+    | 9.5    |
| A     | 9.0    |
| B+    | 8.5    |
| B     | 8.0    |
| C     | 7.5    |
| P     | 7.0    |

### Calculation Formula

**GPA Calculation (per semester):**
```
GPA = (Sum of all grade points) / (Total credits)

Where:
- Grade points = Grade point value × Credits
- Law subjects = 4 credits
- Non-law subjects = 3 credits
```

**CGPA Calculation:**
```
CGPA = (Sum of all semester GPAs) / (Number of semesters)
```

**Special Rule:**
- English subject in Semester 1 is automatically excluded from GPA calculation

### Example Calculation

For Semester 1:
- Legal Language: A+ (9.5) × 4 = 38
- Torts: A (9.0) × 4 = 36
- Political Science: B (8.0) × 3 = 24
- History: C (7.5) × 3 = 22.5
- Sociology: B+ (8.5) × 3 = 25.5

**Total:** 146 points / 17 credits = **8.59 GPA**

## 🎨 Customization

### Modifying the Grading Rubric

1. Click the **"Edit"** button in the Grading Rubric section
2. Modify existing grades or add new ones
3. Click **"Done"** to save your changes
4. Use **"Reset to Default"** to restore original values

### Data Storage

All data is stored in your browser's localStorage, including:
- Custom grading rubric
- All semesters and subjects
- Calculated GPAs

**Note:** Clearing your browser data will delete all saved information.

## 📁 Project Structure

```
gpa-calculator/
├── index.html      # Main HTML structure
├── styles.css      # Styling and design system
├── app.js          # Application logic and calculations
└── README.md       # This file
```

## 🛠️ Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with custom properties, gradients, and animations
- **Vanilla JavaScript**: No frameworks or dependencies
- **localStorage API**: Client-side data persistence

## 🎯 Key Features Explained

### Grading Rubric Management
- Add, edit, or remove grade levels
- Customize point values for each grade
- Reset to default values anytime

### Semester Management
- Add unlimited semesters
- Each semester tracks multiple subjects
- Remove semesters when needed

### Subject Input
- Subject name
- Grade selection (from your custom rubric)
- Type selection (Law/Non-Law for credit calculation)

### Results Display
- Individual semester GPAs
- Overall CGPA
- Total semester count
- Visual breakdown of all semester GPAs

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

Created with ❤️ for law school students

## 🙏 Acknowledgments

- Designed for law school grading systems
- Built with modern web technologies
- Inspired by the need for a simple, customizable GPA calculator

---

**Note:** This calculator is designed for educational purposes. Always verify your GPA calculations with your institution's official records.

## 📞 Support

If you encounter any issues or have questions:
1. Check the calculation formula above
2. Verify your grading rubric matches your institution's system
3. Open an issue on GitHub

---

Made with 🎓 for students, by students
