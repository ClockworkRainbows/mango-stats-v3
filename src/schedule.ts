import fetchAndPersistStats, { CLUSTER_TYPE } from "../lib/fetchStats"

const cluster = (process.env.CLUSTER || "devnet") as CLUSTER_TYPE

fetchAndPersistStats(cluster)
