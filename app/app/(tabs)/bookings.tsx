import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../src/api/client';
import { theme } from '../../src/theme';
import { Card } from '../../src/components/Card';

export default function BookingsScreen() {
  const queryClient = useQueryClient();

  // Live Active Queue from DB
  const { data: activeData, isLoading: loadingActive } = useQuery({
    queryKey: ['active-queue'],
    queryFn: async () => {
      const res = await apiClient.get('/user/active-queue');
      return res.data.activeQueue;
    },
    refetchInterval: 5000,
  });

  // Live History from DB
  const { data: historyData, isLoading: loadingHistory } = useQuery({
    queryKey: ['user-history'],
    queryFn: async () => {
      const res = await apiClient.get('/user/history');
      return res.data.history || [];
    },
    refetchInterval: 10000,
  });

  // Cancel Queue Mutation
  const cancelMutation = useMutation({
    mutationFn: async (queueId: number) => {
      await apiClient.post('/queue/cancel', { queueId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-queue'] });
      queryClient.invalidateQueries({ queryKey: ['user-history'] });
      queryClient.invalidateQueries({ queryKey: ['salons'] });
    },
    onError: () => {
      Alert.alert('Error', 'Could not cancel queue');
    },
  });

  const activeQueue = activeData;
  const historyList = historyData || [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>My Queues & Activity</Text>
      </View>

      <View style={styles.content}>
        {/* Active Live Queue Tracking Card */}
        {loadingActive ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        ) : activeQueue ? (
          <View style={styles.activeCard}>
            <View style={styles.activeCardHeader}>
              <View style={styles.liveBadge}>
                <View style={styles.pulseDot} />
                <Text style={styles.liveBadgeText}>LIVE QUEUE TRACKER</Text>
              </View>
              <Text style={styles.tokenText}>Token #{activeQueue.tokenNumber || 12}</Text>
            </View>

            <Text style={styles.salonTitle}>{activeQueue.salonName}</Text>
            <Text style={styles.salonSub}>{activeQueue.address || 'Bhubaneswar'}</Text>

            {/* Stepper Progress Bar */}
            <View style={styles.progressSection}>
              <View style={styles.progressBarBg}>
                <View style={styles.progressBarFill} />
              </View>

              <View style={styles.stepsRow}>
                <View style={styles.stepItem}>
                  <View style={[styles.stepDot, styles.stepDotDone]}>
                    <Text style={styles.stepCheck}>✓</Text>
                  </View>
                  <Text style={styles.stepLabel}>Joined</Text>
                </View>
                <View style={styles.stepItem}>
                  <View style={[styles.stepDot, styles.stepDotActive]}>
                    <Text style={styles.stepActiveNum}>{activeQueue.position}</Text>
                  </View>
                  <Text style={styles.stepLabelActive}>In Queue (#{activeQueue.position})</Text>
                </View>
                <View style={styles.stepItem}>
                  <View style={styles.stepDot}>
                    <Text style={styles.stepUpcomingNum}>3</Text>
                  </View>
                  <Text style={styles.stepLabel}>In Chair</Text>
                </View>
              </View>
            </View>

            {/* Wait ETA Box */}
            <View style={styles.etaBox}>
              <View>
                <Text style={styles.etaBoxLabel}>ESTIMATED WALK-IN</Text>
                <Text style={styles.etaBoxValue}>{activeQueue.waitTime || 5} mins left</Text>
              </View>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => cancelMutation.mutate(activeQueue.id)}
                disabled={cancelMutation.isPending}
              >
                <Text style={styles.cancelBtnText}>
                  {cancelMutation.isPending ? 'Cancelling...' : 'Leave Queue'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>⏳</Text>
            <Text style={styles.emptyTitle}>No Active Queue</Text>
            <Text style={styles.emptyText}>Join a queue from the Home screen to track your live status in real time.</Text>
          </Card>
        )}

        {/* Past Visit History from Database */}
        <Text style={styles.sectionHeading}>PAST VISITS & RECENT ACTIVITY</Text>
        {loadingHistory ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : historyList.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No past visit history found in database.</Text>
          </Card>
        ) : (
          historyList.map((item: any) => (
            <Card key={item.id} style={styles.historyCard}>
              <View style={styles.historyTop}>
                <Text style={styles.historySalon}>{item.salonName}</Text>
                <Text style={styles.historyPrice}>{item.price}</Text>
              </View>
              <Text style={styles.historyService}>{item.service}</Text>
              <View style={styles.historyFooter}>
                <Text style={styles.historyDate}>🗓️ {item.date}</Text>
                <View style={styles.completedBadge}>
                  <Text style={styles.completedText}>✓ {item.status}</Text>
                </View>
              </View>
            </Card>
          ))
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerBar: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.text,
  },
  content: {
    padding: theme.spacing.lg,
  },
  activeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginBottom: theme.spacing.xl,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  activeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EDE4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radii.full,
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
  tokenText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.textMuted,
  },
  salonTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.text,
  },
  salonSub: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F5EDE4',
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '60%',
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F5EDE4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepDotDone: {
    backgroundColor: theme.colors.primary,
  },
  stepDotActive: {
    backgroundColor: theme.colors.primary,
    borderWidth: 2,
    borderColor: '#F5EDE4',
  },
  stepCheck: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  stepActiveNum: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  stepUpcomingNum: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  stepLabelActive: {
    fontSize: 10,
    color: theme.colors.primary,
    fontWeight: '800',
  },
  etaBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    padding: 14,
  },
  etaBoxLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  etaBoxValue: {
    fontSize: 16,
    fontWeight: '900',
    color: theme.colors.text,
    marginTop: 2,
  },
  cancelBtn: {
    backgroundColor: '#F5EDE4',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radii.full,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  emptyCard: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '900',
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  historyCard: {
    marginBottom: 12,
    padding: 14,
  },
  historyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historySalon: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.text,
  },
  historyPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  historyService: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 10,
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F5EDE4',
    paddingTop: 8,
  },
  historyDate: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  completedBadge: {
    backgroundColor: '#F5EDE4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radii.full,
  },
  completedText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.primary,
  },
});
