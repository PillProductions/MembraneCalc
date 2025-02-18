import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";

// A small fade animation for the advanced settings
const fadeStyle = {
  transition: "max-height 0.4s ease, opacity 0.4s ease",
  overflow: "hidden",
  opacity: 1,
};

export default function MembraneCalculator() {
  /************************************************
   *               State Declarations             *
   ************************************************/
  // Basic / Required inputs
  const [area, setArea] = useState(5000);
  const [energyType, setEnergyType] = useState("Fjernvarme + El");

  // Advanced parameters (hidden by default)
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Consumption parameters
  const [heatingConsumption, setHeatingConsumption] = useState(200); // kWh/m²/yr
  const [coolingConsumption, setCoolingConsumption] = useState(50);  // kWh/m²/yr

  // Energy rates (DKK/kWh)
  const [energyRateFjernvarme, setEnergyRateFjernvarme] = useState(0.8);
  const [energyRateGas, setEnergyRateGas] = useState(1.2);
  const [energyRateEl, setEnergyRateEl] = useState(2.0);

  // CO2 emissions (kg CO2/kWh)
  const [co2Fjernvarme, setCo2Fjernvarme] = useState(0.1);
  const [co2Gas, setCo2Gas] = useState(0.22);
  const [co2El, setCo2El] = useState(0.07);

  // Membrane details
  const [membraneCostPerSqm, setMembraneCostPerSqm] = useState(450);

  // Percentage savings by membrane
  const [energySavingsPercent, setEnergySavingsPercent] = useState(15);

  // Carbon tax (DKK/ton CO2)
  const [co2TaxRate, setCo2TaxRate] = useState(300);

  /************************************************
   *           Derived Values & Calculations       *
   ************************************************/
  const selectedEnergyRates = {
    heat: energyType === "Fjernvarme + El" ? energyRateFjernvarme : 0,
    gas: energyType === "Naturgas + El" ? energyRateGas : 0,
    electricity: energyRateEl,
    co2Heat: energyType === "Fjernvarme + El" ? co2Fjernvarme : 0,
    co2Gas: energyType === "Naturgas + El" ? co2Gas : 0,
  };

  // Annual energy cost (heat + cooling)
  const annualEnergyCost =
    area * heatingConsumption * (selectedEnergyRates.heat + selectedEnergyRates.gas) +
    area * coolingConsumption * selectedEnergyRates.electricity;

  // Total CO2 emissions (tons per year)
  const totalCo2Emission =
    (area * heatingConsumption * selectedEnergyRates.co2Heat +
      area * heatingConsumption * selectedEnergyRates.co2Gas +
      area * coolingConsumption * co2El) /
    1000;

  // Annual cost of the CO2 tax
  const annualCo2Tax = totalCo2Emission * co2TaxRate;

  // Total cost BEFORE membrane
  const totalCostBefore = annualEnergyCost + annualCo2Tax;

  // Membrane investment
  const membraneInvestment = membraneCostPerSqm * area;

  // Total cost AFTER membrane
  const totalCostAfter = totalCostBefore * (1 - energySavingsPercent / 100);

  // Annual savings
  const yearlySavings = totalCostBefore - totalCostAfter;

  // Break-even (in years)
  const breakEvenYears = yearlySavings > 0 ? membraneInvestment / yearlySavings : 0;

  // Data for the chart (30-year projection)
  const data = Array.from({ length: 30 }, (_, i) => {
    const year = i + 1;
    return {
      year,
      savings: yearlySavings * year,
    };
  });

  /************************************************
   *                Event Handlers                *
   ************************************************/
  const toggleAdvanced = () => {
    setShowAdvanced(!showAdvanced);
  };

  /************************************************
   *                  JSX Return                  *
   ************************************************/
  return (
    <div style={styles.container}>
      <h2 style={styles.headline}>Membran Besparelses Kalkulator</h2>

      {/* Input Section */}
      <div style={styles.inputGrid}>
        {/* Basic Inputs */}
        <div style={styles.column}>
          <label style={styles.label}>
            Bygningsareal (m²):
            <input
              type="number"
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
              style={styles.basicInput}
            />
          </label>

          <label style={styles.label}>
            Energitype:
            <select
              value={energyType}
              onChange={(e) => setEnergyType(e.target.value)}
              style={styles.basicInput}
            >
              <option>Fjernvarme + El</option>
              <option>Naturgas + El</option>
            </select>
          </label>

          <button style={styles.advancedBtn} onClick={toggleAdvanced}>
            {showAdvanced ? "Skjul avancerede indstillinger" : "Vis avancerede indstillinger"}
          </button>
        </div>

        {/* Results Summary */}
        <div style={styles.resultBox}>
          <h3>
            Pris for membran: <strong>{membraneInvestment.toLocaleString()}</strong> kr.
          </h3>
          <h3>
            Udledt CO₂ før membran: <strong>{totalCo2Emission.toFixed(2)}</strong> tons/år (
            <strong>{annualCo2Tax.toLocaleString()}</strong> kr.)
          </h3>
          <h3>
            Total omkostning før membran: <strong>{totalCostBefore.toLocaleString()}</strong> kr./år
          </h3>
          <h3>
            Total omkostning efter membran: <strong>{totalCostAfter.toLocaleString()}</strong> kr./år
          </h3>
          <h3 style={{ color: "green" }}>
            Besparelse pr. år: <strong>{yearlySavings.toLocaleString()}</strong> kr.
          </h3>
          <h3>
            Break-even: <strong>{breakEvenYears.toFixed(1)}</strong> år
          </h3>
        </div>
      </div>

      {/* Advanced Settings (toggle) */}
      <div
        style={{
          ...fadeStyle,
          maxHeight: showAdvanced ? "1000px" : "0px",
          opacity: showAdvanced ? 1 : 0,
          marginBottom: showAdvanced ? "20px" : "0",
        }}
      >
        {showAdvanced && (
          <div style={styles.advancedGrid}>
            <div style={styles.advancedColumn}>
              <h4>Forbrug (kWh/m²/år)</h4>
              <label style={styles.smallLabel}>
                Opvarmning:
                <input
                  type="number"
                  step="1"
                  value={heatingConsumption}
                  onChange={(e) => setHeatingConsumption(Number(e.target.value))}
                  style={styles.smallInput}
                />
              </label>
              <label style={styles.smallLabel}>
                Køling:
                <input
                  type="number"
                  step="1"
                  value={coolingConsumption}
                  onChange={(e) => setCoolingConsumption(Number(e.target.value))}
                  style={styles.smallInput}
                />
              </label>
            </div>

            <div style={styles.advancedColumn}>
              <h4>Energipriser (DKK/kWh)</h4>
              <label style={styles.smallLabel}>
                Fjernvarme:
                <input
                  type="number"
                  step="0.1"
                  value={energyRateFjernvarme}
                  onChange={(e) => setEnergyRateFjernvarme(Number(e.target.value))}
                  style={styles.smallInput}
                />
              </label>
              <label style={styles.smallLabel}>
                Naturgas:
                <input
                  type="number"
                  step="0.1"
                  value={energyRateGas}
                  onChange={(e) => setEnergyRateGas(Number(e.target.value))}
                  style={styles.smallInput}
                />
              </label>
              <label style={styles.smallLabel}>
                El:
                <input
                  type="number"
                  step="0.1"
                  value={energyRateEl}
                  onChange={(e) => setEnergyRateEl(Number(e.target.value))}
                  style={styles.smallInput}
                />
              </label>
            </div>

            <div style={styles.advancedColumn}>
              <h4>CO₂ udledning (kg/kWh)</h4>
              <label style={styles.smallLabel}>
                Fjernvarme:
                <input
                  type="number"
                  step="0.01"
                  value={co2Fjernvarme}
                  onChange={(e) => setCo2Fjernvarme(Number(e.target.value))}
                  style={styles.smallInput}
                />
              </label>
              <label style={styles.smallLabel}>
                Naturgas:
                <input
                  type="number"
                  step="0.01"
                  value={co2Gas}
                  onChange={(e) => setCo2Gas(Number(e.target.value))}
                  style={styles.smallInput}
                />
              </label>
              <label style={styles.smallLabel}>
                El:
                <input
                  type="number"
                  step="0.01"
                  value={co2El}
                  onChange={(e) => setCo2El(Number(e.target.value))}
                  style={styles.smallInput}
                />
              </label>
            </div>

            <div style={styles.advancedColumn}>
              <h4>Membran & øvrige</h4>
              <label style={styles.smallLabel}>
                Membranpris (kr./m²):
                <input
                  type="number"
                  step="1"
                  value={membraneCostPerSqm}
                  onChange={(e) => setMembraneCostPerSqm(Number(e.target.value))}
                  style={styles.smallInput}
                />
              </label>
              <label style={styles.smallLabel}>
                Energi-besparelse (%):
                <input
                  type="number"
                  step="1"
                  value={energySavingsPercent}
                  onChange={(e) => setEnergySavingsPercent(Number(e.target.value))}
                  style={styles.smallInput}
                />
              </label>
              <label style={styles.smallLabel}>
                CO₂-afgift (kr./ton):
                <input
                  type="number"
                  step="10"
                  value={co2TaxRate}
                  onChange={(e) => setCo2TaxRate(Number(e.target.value))}
                  style={styles.smallInput}
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Chart Section */}
      <div style={{ width: "100%", height: 500 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 60, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            <XAxis
              dataKey="year"
              label={{ value: "År", position: "insideBottom", offset: -5 }}
              tick={{ fontSize: 14 }}
            />
            <YAxis
              label={{
                value: "Akkumuleret besparelse (kr.)",
                angle: -90,
                position: "insideLeft",
                dx: -35,
                dy: 85,
              }}
              tick={{ fontSize: 14 }}
            />
            <Tooltip formatter={(value) => `${Number(value).toLocaleString()} kr.`} />
            <Legend
              wrapperStyle={{
                marginLeft: 25,
                position: "relative"
              }}
            />
            <ReferenceLine
              x={breakEvenYears}
              stroke="red"
              strokeDasharray="3 3"
              label={{ value: "Break-even", position: "top", fill: "red" }}
            />
            <Line
              type="monotone"
              dataKey="savings"
              stroke="#007bff"
              strokeWidth={3}
              dot={{ r: 5, fill: "#007bff" }}
              activeDot={{ r: 8 }}
              name="Besparelse"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/************************************************
 *                Inline Styles                 *
 ************************************************/
const styles = {
  container: {
    // This makes the whole content a floating box
    maxWidth: "1000px",
    margin: "0 auto",
    marginTop: "30px",
    backgroundColor: "#fff",
    borderRadius: "35px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
    padding: "20px",
    color: "#333",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  headline: {
    textAlign: "center",
    marginBottom: "30px",
  },
  inputGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "20px",
  },
  advancedGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    background: "#f9f9f9",
    padding: "20px",
    borderRadius: "8px",
  },
  column: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  advancedColumn: {
    display: "flex",
    flexDirection: "column",
    border: "1px solid #ddd",
    borderRadius: "6px",
    padding: "10px",
    backgroundColor: "#fff",
  },
  resultBox: {
    textAlign: "left",
    padding: "10px 15px",
    borderRadius: "8px",
    background: "#e6f7ff",
    alignSelf: "start",
  },
  label: {
    display: "block",
    marginBottom: "15px",
    fontWeight: "600",
  },
  smallLabel: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
    fontSize: "0.9rem",
  },
  // Basic input style only for the main area and energy type
  basicInput: {
    width: "100%",
    marginTop: "5px",
    padding: "6px",
    boxSizing: "border-box",
    fontSize: "1rem",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
    border: 0
  },
  // Non-shadowed inputs for advanced settings
  input: {
    width: "100%",
    marginTop: "5px",
    padding: "6px",
    boxSizing: "border-box",
    fontSize: "1rem",
    border: 0
  },
  // Shadowed smaller inputs in advanced settings
  smallInput: {
    width: "60px",
    textAlign: "right",
    marginLeft: "10px",
    border: 0
  },
  advancedBtn: {
    padding: "10px",
    fontSize: "1rem",
    cursor: "pointer",
    marginTop: "10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
  },
};
