import type { Chip } from "./types";

export const CHIPS: Chip[] = [
  { id: "h100", name: "H100 SXM", vendor: "NVIDIA", memoryGB: 80, tflops: 989, powerW: 700, interconnect: "NVLink 4.0", vramType: "HBM3", year: 2022 },
  { id: "h200", name: "H200 SXM", vendor: "NVIDIA", memoryGB: 141, tflops: 989, powerW: 700, interconnect: "NVLink 4.0", vramType: "HBM3e", year: 2024 },
  { id: "b200", name: "B200", vendor: "NVIDIA", memoryGB: 192, tflops: 2250, powerW: 1000, interconnect: "NVLink 5.0", vramType: "HBM3e", year: 2024 },
  { id: "a100", name: "A100 80GB", vendor: "NVIDIA", memoryGB: 80, tflops: 312, powerW: 400, interconnect: "NVLink 3.0", vramType: "HBM2e", year: 2020 },
  { id: "l40s", name: "L40S", vendor: "NVIDIA", memoryGB: 48, tflops: 362, powerW: 350, interconnect: "PCIe 5.0", vramType: "GDDR6", year: 2023 },
  { id: "rtx5090", name: "RTX 5090", vendor: "NVIDIA", memoryGB: 32, tflops: 104, powerW: 575, interconnect: "PCIe 5.0", vramType: "GDDR7", year: 2025 },
  { id: "rtxpro6000", name: "RTX Pro 6000", vendor: "NVIDIA", memoryGB: 96, tflops: 125, powerW: 400, interconnect: "PCIe 5.0", vramType: "GDDR7", year: 2025 },
  { id: "mi300x", name: "MI300X", vendor: "AMD", memoryGB: 192, tflops: 1307, powerW: 750, interconnect: "Infinity Fabric", vramType: "HBM3", year: 2023 },
  { id: "mi325x", name: "MI325X", vendor: "AMD", memoryGB: 256, tflops: 1307, powerW: 750, interconnect: "Infinity Fabric", vramType: "HBM3e", year: 2024 },
  { id: "m3ultra", name: "M3 Ultra", vendor: "Apple", memoryGB: 192, tflops: 33, powerW: 200, interconnect: "Unified Memory", vramType: "Unified", year: 2025 },
];

export const CHIP_BY_ID: Record<string, Chip> = Object.fromEntries(CHIPS.map((c) => [c.id, c]));
